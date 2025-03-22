import { VisualizerMode, VisualizerConfig } from './types';

/**
 * Extended configuration for the circular visualizer
 * Includes additional parameters specific to circular visualization
 */
const defaultConfig: Required<VisualizerConfig> & {
    /** Base radius as a proportion of the canvas size (0.0-1.0) */
    baseRadius: number;
    /** Scale factor for radius variation (higher values = more pronounced effect) */
    radiusScale: number;
} = {
    lineWidth: 2,
    strokeStyle: 'rgb(100, 100, 255)',
    backgroundColor: 'rgb(20, 20, 20)',
    baseRadius: 0.6,  // 基本の円の大きさ（キャンバスの最小辺に対する比率）
    radiusScale: 0.5, // 波形の変化の大きさ
};

/**
 * Circular visualizer implementation that draws the waveform in a circular pattern
 * This visualizer represents audio data as variations in the radius of a circle
 */
export const circularVisualizer: VisualizerMode = {
    id: 'circular',
    name: '円形表示',
    description: '円形の波形表示',
    /**
     * Draws the circular waveform visualization
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

        // Calculate the center point and base radius
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) * config.baseRadius;

        // Set up the line style for the waveform
        ctx.lineWidth = config.lineWidth;
        ctx.strokeStyle = config.strokeStyle;
        ctx.beginPath();

        // Draw the circular waveform
        for (let i = 0; i < bufferLength; i++) {
            // Normalize the value to -1.0 to 1.0 range
            const v = dataArray[i] / 128.0;
            // Calculate the angle for this point
            const percent = i / bufferLength;
            const angle = percent * Math.PI * 2;
            
            // Calculate the radius variation based on audio data
            const radiusOffset = ((v - 1) * radius * config.radiusScale);
            const currentRadius = radius + radiusOffset;

            // Convert polar coordinates to cartesian
            const x = centerX + Math.cos(angle) * currentRadius;
            const y = centerY + Math.sin(angle) * currentRadius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        // Complete the circle and draw it
        ctx.closePath();
        ctx.stroke();
    },
}; 