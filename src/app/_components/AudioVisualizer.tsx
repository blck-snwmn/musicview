'use client';

import { useEffect, useRef, useState } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { visualizers, VisualizerMode } from './visualizers';

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
    const [volume, setVolume] = useState(1);

    // 波形データの保持用
    const lastDataArrayRef = useRef<Uint8Array | null>(null);

    // 初期化済みかどうかのフラグ
    const isInitializedRef = useRef(false);

    // アニメーションの状態管理
    const drawRef = useRef<(() => void) | null>(null);

    // 再生の開始
    const startPlayback = () => {
        if (!audioContext || !audioBuffer) return;

        // 既存の音声ノードをクリーンアップ
        if (sourceRef.current) {
            sourceRef.current.stop();
            sourceRef.current.disconnect();
        }

        // 音声ノードの設定
        const source = audioContext.createBufferSource();
        const gainNode = gainNodeRef.current || audioContext.createGain();
        const analyser = analyserRef.current || audioContext.createAnalyser();

        source.buffer = audioBuffer;
        source.connect(gainNode);
        gainNode.connect(analyser);
        analyser.connect(audioContext.destination);

        // 音量の設定
        gainNode.gain.value = volume;

        // アナライザーの設定
        analyser.fftSize = 2048;

        // ノードの参照を保存
        sourceRef.current = source;
        gainNodeRef.current = gainNode;
        analyserRef.current = analyser;

        // 再生開始
        source.start(0);
        setIsPlaying(true);

        // アニメーションを再開
        if (drawRef.current) {
            drawRef.current();
        }
    };

    // 再生の停止
    const stopPlayback = () => {
        if (sourceRef.current) {
            sourceRef.current.stop();
            sourceRef.current.disconnect();
            sourceRef.current = null;
            setIsPlaying(false);
            // アニメーションフレームをキャンセル
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = undefined;
            }
        }
    };

    // 音量の変更
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = newVolume;
        }
    };

    // 再生/停止の切り替え
    const togglePlayback = () => {
        if (isPlaying) {
            stopPlayback();
        } else {
            startPlayback();
        }
    };

    useEffect(() => {
        if (!canvasRef.current || !audioContext || !audioBuffer) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // 初回のみ再生を開始
        if (!isInitializedRef.current) {
            startPlayback();
            isInitializedRef.current = true;
        }

        // 停止中の初期状態のデータを作成
        const createNeutralData = () => {
            const dataArray = new Uint8Array(1024); // analyser.fftSize / 2
            dataArray.fill(128); // 中央値で埋める（振幅0）
            return dataArray;
        };

        // draw関数の定義
        const draw = () => {
            if (!analyserRef.current) return;

            // 再生中のみアニメーションを継続
            if (isPlaying) {
                animationFrameRef.current = requestAnimationFrame(draw);

                // データの取得
                const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                analyserRef.current.getByteTimeDomainData(dataArray);
                lastDataArrayRef.current = dataArray;
            }

            // キャンバスをクリア
            ctx.fillStyle = 'rgb(20, 20, 20)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 描画データの選択（再生中は実データ、停止中は初期状態）
            const drawData = isPlaying ? lastDataArrayRef.current : createNeutralData();
            if (drawData) {
                currentVisualizer.draw(ctx, drawData, canvas);
            }
        };

        // draw関数の参照を保存
        drawRef.current = draw;

        // アニメーションを開始
        draw();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = undefined;
            }
        };
    }, [audioContext, audioBuffer, currentVisualizer, isPlaying]);

    /**
     * Handles switching to the next visualizer in the list
     * Cycles through available visualizers in order
     */
    const handleVisualizerChange = () => {
        const currentIndex = visualizers.findIndex(v => v.id === currentVisualizer.id);
        const nextIndex = (currentIndex + 1) % visualizers.length;
        setCurrentVisualizer(visualizers[nextIndex]);
    };

    return (
        <div className="w-full max-w-4xl">
            <div className="mb-4 flex justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={togglePlayback}
                        className="px-3 py-1.5 text-sm bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
                    >
                        {isPlaying ? '停止' : '再生'}
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
                            className="w-24"
                        />
                    </div>
                </div>
                <button
                    onClick={handleVisualizerChange}
                    className="px-3 py-1.5 text-sm bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
                    title={currentVisualizer.description}
                >
                    {currentVisualizer.name}
                </button>
            </div>
            <div className="aspect-[2/1] bg-gray-900 rounded-lg overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                />
            </div>
        </div>
    );
}; 