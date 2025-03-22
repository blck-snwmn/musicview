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

    useEffect(() => {
        // Skip if any required resources are missing
        if (!canvasRef.current || !audioContext || !audioBuffer) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to match display size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Set up audio processing pipeline
        const source = audioContext.createBufferSource();
        const analyser = audioContext.createAnalyser();
        source.buffer = audioBuffer;
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        // Configure analyzer node
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Start audio playback
        source.start(0);

        /**
         * Animation loop function
         * Gets current audio data and calls the active visualizer's draw function
         */
        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            analyser.getByteTimeDomainData(dataArray);
            currentVisualizer.draw(ctx, dataArray, canvas);
        };

        draw();

        // Cleanup function
        return () => {
            // Cancel any pending animation frame
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            // Stop and disconnect audio nodes
            source.stop();
            source.disconnect();
            analyser.disconnect();
        };
    }, [audioContext, audioBuffer, currentVisualizer]);

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
            <div className="mb-4 flex justify-end">
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