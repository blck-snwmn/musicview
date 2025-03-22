import { VisualizerMode, VisualizerConfig, DrawArea } from './types';

/**
 * Extended configuration for the circular visualizer
 * Includes additional parameters specific to circular visualization
 */
const defaultConfig: Required<VisualizerConfig> & {
    /** Base radius as a proportion of the canvas size (0.0-1.0) */
    baseRadius: number;
    /** Scale factor for radius variation (higher values = more pronounced effect) */
    radiusScale: number;
    /** Scale factor for low frequency emphasis */
    lowFreqEmphasis: number;
    /** Base circle color */
    baseCircleColor: string;
} = {
    lineWidth: 2,
    strokeStyle: 'rgb(100, 100, 255)',
    backgroundColor: 'rgb(20, 20, 20)',
    baseRadius: 0.45,  // 基本の円の大きさ
    radiusScale: 0.8,  // 変化の幅を抑える
    lowFreqEmphasis: 1.5,  // 低周波の強調度
    baseCircleColor: 'rgb(40, 40, 80)'  // 基本円の色
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
     * @param drawArea - Drawing area parameters
     */
    draw: (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, canvas: HTMLCanvasElement, drawArea: DrawArea) => {
        const config = { ...defaultConfig };
        const bufferLength = dataArray.length;

        // Calculate the center point and base radius
        const centerX = drawArea.x + drawArea.width / 2;
        const centerY = drawArea.y + drawArea.height / 2;
        const radius = Math.min(drawArea.width, drawArea.height) / 2 * config.baseRadius;

        // 基本円を描画
        ctx.beginPath();
        ctx.strokeStyle = config.baseCircleColor;
        ctx.lineWidth = config.lineWidth;
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw the frequency spectrum in a circle
        ctx.lineWidth = config.lineWidth;
        ctx.strokeStyle = config.strokeStyle;
        ctx.beginPath();

        for (let i = 0; i < bufferLength; i++) {
            // Calculate the angle for this point
            const percent = i / bufferLength;
            const angle = percent * Math.PI * 2 - Math.PI / 2; // Start from top (-90 degrees)

            // 低周波域をより強調して表示
            const emphasis = i < bufferLength * 0.3 ? 
                config.lowFreqEmphasis : 
                1 + (config.lowFreqEmphasis - 1) * Math.pow(1 - i / bufferLength, 2);

            // Calculate radius variation based on frequency data
            const value = dataArray[i] / 255.0;
            const radiusOffset = value * radius * config.radiusScale * emphasis;
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