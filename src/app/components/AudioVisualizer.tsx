'use client';

import { useEffect, useRef, useState } from 'react';
import { useAudio } from '../contexts/AudioContext';

type VisualizerMode = 'linear' | 'circular';

export const AudioVisualizer = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { audioContext, audioBuffer } = useAudio();
    const animationFrameRef = useRef<number | undefined>(undefined);
    const [mode, setMode] = useState<VisualizerMode>('linear');

    useEffect(() => {
        if (!canvasRef.current || !audioContext || !audioBuffer) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Create audio source and analyzer
        const source = audioContext.createBufferSource();
        const analyser = audioContext.createAnalyser();
        source.buffer = audioBuffer;
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        // Configure analyzer
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Start playing
        source.start(0);

        const drawLinear = () => {
            analyser.getByteTimeDomainData(dataArray);

            ctx.fillStyle = 'rgb(20, 20, 20)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgb(100, 100, 255)';
            ctx.beginPath();

            const sliceWidth = canvas.width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
        };

        const drawCircular = () => {
            analyser.getByteTimeDomainData(dataArray);

            ctx.fillStyle = 'rgb(20, 20, 20)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) * 0.6;

            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgb(100, 100, 255)';
            ctx.beginPath();

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const percent = i / bufferLength;
                const angle = percent * Math.PI * 2;

                const radiusOffset = ((v - 1) * radius * 0.5);
                const currentRadius = radius + radiusOffset;

                const x = centerX + Math.cos(angle) * currentRadius;
                const y = centerY + Math.sin(angle) * currentRadius;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.closePath();
            ctx.stroke();
        };

        // Animation function
        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            if (mode === 'linear') {
                drawLinear();
            } else {
                drawCircular();
            }
        };

        draw();

        // Cleanup
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            source.stop();
            source.disconnect();
            analyser.disconnect();
        };
    }, [audioContext, audioBuffer, mode]);

    return (
        <div className="w-full max-w-4xl">
            <div className="mb-4 flex justify-end">
                <button
                    onClick={() => setMode(mode === 'linear' ? 'circular' : 'linear')}
                    className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
                >
                    {mode === 'linear' ? '円形表示' : '線形表示'}
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