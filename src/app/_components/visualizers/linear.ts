import { VisualizerMode, VisualizerConfig } from './types';

/**
 * Default configuration for the linear visualizer
 * These values can be customized if needed
 */
const defaultConfig: Required<VisualizerConfig> = {
    lineWidth: 2,
    strokeStyle: 'rgb(100, 100, 255)',
    backgroundColor: 'rgb(20, 20, 20)',
};

/**
 * Linear visualizer implementation that draws the waveform from left to right
 * This visualizer shows the audio waveform in its time domain representation
 */
export const linearVisualizer: VisualizerMode = {
    id: 'linear',
    name: '線形表示',
    description: '左から右への波形表示',
    /**
     * Draws the linear waveform visualization
     * @param ctx - Canvas rendering context
     * @param dataArray - Audio data array (values 0-255)
     * @param canvas - Canvas element
     */
    draw: (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, canvas: HTMLCanvasElement) => {
        const config = { ...defaultConfig };
        const bufferLength = dataArray.length;

        // Clear the canvas with the background color
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set up the line style for the waveform
        ctx.lineWidth = config.lineWidth;
        ctx.strokeStyle = config.strokeStyle;
        ctx.beginPath();

        // Calculate the width of each segment
        const sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;

        // Draw the waveform by connecting points
        for (let i = 0; i < bufferLength; i++) {
            // Normalize the value to -1.0 to 1.0 range
            const v = dataArray[i] / 128.0;
            // Scale the value to canvas height
            const y = v * canvas.height / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        // Complete the path and draw it
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
    },
}; 