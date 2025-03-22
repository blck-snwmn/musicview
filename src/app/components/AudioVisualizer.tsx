'use client';

import { useEffect, useRef } from 'react';
import { useAudio } from '../contexts/AudioContext';

export const AudioVisualizer = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { audioContext, audioBuffer } = useAudio();
    const animationFrameRef = useRef<number | undefined>(undefined);

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

        // Animation function
        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);

            analyser.getByteTimeDomainData(dataArray);

            // Clear canvas
            ctx.fillStyle = 'rgb(20, 20, 20)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw waveform
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
    }, [audioContext, audioBuffer]);

    return (
        <div className="w-full max-w-4xl aspect-[2/1] bg-gray-900 rounded-lg overflow-hidden">
            <canvas
                ref={canvasRef}
                className="w-full h-full"
            />
        </div>
    );
}; 