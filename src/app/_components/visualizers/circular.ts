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
    baseRadius: 0.45,  // より大きな基本半径
    radiusScale: 1.5,  // 適度な変化の幅
};

/**
 * Circular visualizer implementation that draws frequency data in a circular pattern
 * This visualizer represents frequency spectrum as variations in the radius of a circle
 */
export const circularVisualizer: VisualizerMode = {
    id: 'circular',
    name: '円形周波数表示',
    description: '周波数スペクトラムを円形で表示',
    /**
     * Draws the circular frequency visualization
     * @param ctx - Canvas rendering context
     * @param dataArray - Audio frequency data array (values 0-255)
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

        // Draw the frequency spectrum in a circle
        ctx.lineWidth = config.lineWidth;
        ctx.strokeStyle = config.strokeStyle;
        ctx.beginPath();

        for (let i = 0; i < bufferLength; i++) {
            // Calculate the angle for this point
            const percent = i / bufferLength;
            const angle = percent * Math.PI * 2 - Math.PI / 2; // Start from top (-90 degrees)

            // Calculate radius variation based on frequency data
            const value = dataArray[i] / 255.0;
            const radiusOffset = value * radius * config.radiusScale;
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