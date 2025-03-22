import { VisualizerMode, VisualizerConfig } from './types';

/**
 * Default configuration for the frequency visualizer
 * These values can be customized if needed
 */
const defaultConfig: Required<VisualizerConfig> & {
    /** Number of frequency bars to display */
    barCount: number;
    /** Spacing between bars (in pixels) */
    barSpacing: number;
    /** Scale factor for bar height */
    heightScale: number;
    /** Colors for different frequency ranges */
    colors: {
        low: string;    // 低周波（低音）
        mid: string;    // 中周波（中音）
        high: string;   // 高周波（高音）
    };
} = {
    lineWidth: 2,
    strokeStyle: 'rgb(100, 100, 255)',
    backgroundColor: 'rgb(20, 20, 20)',
    barCount: 64,
    barSpacing: 2,
    heightScale: 1.5,
    colors: {
        low: 'rgb(255, 50, 50)',    // 赤 (低音)
        mid: 'rgb(50, 255, 50)',    // 緑 (中音)
        high: 'rgb(50, 50, 255)',   // 青 (高音)
    },
};

/**
 * Frequency visualizer implementation that draws frequency data as vertical bars
 * This visualizer shows the audio spectrum in its frequency domain representation
 */
export const frequencyVisualizer: VisualizerMode = {
    id: 'frequency',
    name: '周波数表示',
    description: '周波数スペクトラムをバーで表示',
    /**
     * Draws the frequency spectrum visualization
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

        // Calculate bar width based on canvas size and desired bar count
        const barWidth = (canvas.width - (config.barCount - 1) * config.barSpacing) / config.barCount;

        // Draw frequency bars
        for (let i = 0; i < config.barCount; i++) {
            // Get data for this bar (average of a range of frequencies)
            const dataIndex = Math.floor(i * bufferLength / config.barCount);
            const value = dataArray[dataIndex];

            // Calculate bar height (normalize to canvas height)
            const barHeight = (value / 255.0) * canvas.height * config.heightScale;

            // Calculate bar position
            const x = i * (barWidth + config.barSpacing);
            const y = canvas.height - barHeight;

            // Set color based on frequency range
            const percent = i / config.barCount;
            if (percent < 0.33) {
                ctx.fillStyle = config.colors.low;
            } else if (percent < 0.66) {
                ctx.fillStyle = config.colors.mid;
            } else {
                ctx.fillStyle = config.colors.high;
            }

            // Draw the bar
            ctx.fillRect(x, y, barWidth, barHeight);
        }
    },
}; 