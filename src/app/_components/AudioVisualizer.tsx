"use client";

import { useEffect, useRef, useState } from "react";
import { useAudio } from "../contexts/AudioContext";
import { visualizers, VisualizerMode } from "./visualizers";

/**
 * AudioVisualizer Component
 *
 * A component that visualizes audio data using various visualization modes.
 * Uses Web Audio API for audio processing and Canvas API for rendering.
 *
 * Features:
 * - Multiple visualization modes (linear, circular, etc.)
 * - Real-time audio visualization
 * - Mode switching with smooth transitions
 * - Automatic cleanup of audio resources
 */
export const AudioVisualizer = () => {
  // Canvas reference for drawing
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Audio context and buffer from the parent context
  const { audioContext, audioBuffer } = useAudio();
  // Reference for animation frame to handle cleanup
  const animationFrameRef = useRef<number | undefined>(undefined);
  // Current visualizer state
  const [currentVisualizer, setCurrentVisualizer] = useState<VisualizerMode>(visualizers[0]);

  // 音声ノードの参照を保持
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // 再生状態と音量の管理
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const volumeRef = useRef(volume);

  // 波形データの保持用
  const lastDataArrayRef = useRef<Uint8Array | null>(null);

  // 再生状態に合わせて音声ノードを構築・破棄
  useEffect(() => {
    if (!audioContext || !audioBuffer || !isPlaying) return;

    // 新しいソースを作成
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;

    // アナライザーノードを作成
    const analyser = audioContext.createAnalyser();
    // FFTサイズを小さくして、より見やすい表示に
    analyser.fftSize = 512;
    // より広いデシベル範囲で音を検出
    analyser.minDecibels = -85;
    analyser.maxDecibels = -25;
    // スムージングを調整（0に近いほど反応が敏感に）
    analyser.smoothingTimeConstant = 0.6;

    // ゲインノードを作成
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volumeRef.current;

    // ノードを接続
    source.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(audioContext.destination);

    // 参照を保存
    sourceRef.current = source;
    gainNodeRef.current = gainNode;
    analyserRef.current = analyser;

    // 再生開始（初期表示時は自動再生）
    source.start(0);

    return () => {
      source.stop();
      source.disconnect();
      gainNode.disconnect();
      analyser.disconnect();

      if (sourceRef.current === source) sourceRef.current = null;
      if (gainNodeRef.current === gainNode) gainNodeRef.current = null;
      if (analyserRef.current === analyser) analyserRef.current = null;
    };
  }, [audioBuffer, audioContext, isPlaying]);

  // 音量の変更
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    volumeRef.current = newVolume;
    if (gainNodeRef.current) {
      // 音量が0の場合は完全にミュートにする
      gainNodeRef.current.gain.value = newVolume === 0 ? 0.0000001 : newVolume;
    }
  };

  // 再生/停止の切り替え
  const togglePlayback = () => {
    setIsPlaying((playing) => !playing);
  };

  useEffect(() => {
    if (!canvasRef.current || !audioContext || !audioBuffer) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // 停止中の初期状態のデータを作成
    const createNeutralData = () => {
      const dataArray = new Uint8Array(1024); // analyser.fftSize / 2
      dataArray.fill(0);
      return dataArray;
    };

    // 周波数データを正規化する関数
    const normalizeFrequencyData = (data: Uint8Array): Uint8Array => {
      // 最大値を見つける
      let max = 0;
      for (let i = 0; i < data.length; i++) {
        if (data[i] > max) max = data[i];
      }

      // 最大値が0の場合は全て0を返す
      if (max === 0) return data;

      // 正規化したデータを作成
      const normalized = new Uint8Array(data.length);
      for (let i = 0; i < data.length; i++) {
        // 0-255の範囲に正規化
        normalized[i] = Math.round((data[i] / max) * 255);
      }
      return normalized;
    };

    // アナライザーの設定を調整
    if (analyserRef.current) {
      // より広いデシベル範囲を設定
      analyserRef.current.minDecibels = -90;
      analyserRef.current.maxDecibels = -10;
      // スムージングを調整（0に近いほど反応が敏感に）
      analyserRef.current.smoothingTimeConstant = 0.5;
    }

    // draw関数の定義
    const draw = () => {
      // 再生中のみアニメーションを継続
      const analyser = analyserRef.current;
      if (isPlaying && analyser) {
        animationFrameRef.current = requestAnimationFrame(draw);

        // 周波数データの取得
        const rawData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(rawData);

        // データを正規化
        const normalizedData = normalizeFrequencyData(rawData);
        lastDataArrayRef.current = normalizedData;
      }

      // キャンバスをクリア
      ctx.fillStyle = "rgb(20, 20, 20)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 描画領域に余白を設定
      const margin = {
        x: canvas.width * 0.1, // 左右10%ずつ
        y: canvas.height * 0.1, // 上下10%ずつ
      };
      const drawWidth = canvas.width - margin.x * 2;
      const drawHeight = canvas.height - margin.y * 2;

      // 描画データの選択（再生中は実データ、停止中は初期状態）
      const drawData = isPlaying ? lastDataArrayRef.current : createNeutralData();
      if (drawData) {
        // 描画領域の情報を渡す
        currentVisualizer.draw(ctx, drawData, canvas, {
          x: margin.x,
          y: margin.y,
          width: drawWidth,
          height: drawHeight,
        });
      }
    };

    // アニメーションを開始
    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [audioContext, audioBuffer, currentVisualizer, isPlaying]);

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-4 flex justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlayback}
            className="px-3 py-1.5 text-sm bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
          >
            {isPlaying ? "停止" : "再生"}
          </button>
          <div className="flex items-center gap-2">
            <label htmlFor="volume" className="text-sm text-gray-400">
              音量
            </label>
            <input
              id="volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-48"
            />
          </div>
        </div>
        <select
          value={currentVisualizer.id}
          onChange={(e) => {
            const selected = visualizers.find((v) => v.id === e.target.value);
            if (selected) setCurrentVisualizer(selected);
          }}
          className="px-3 py-1.5 text-sm bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
          title={currentVisualizer.description}
        >
          {visualizers.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>
      <div className="aspect-[2/1] bg-gray-900 rounded-lg overflow-hidden p-4">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
};
