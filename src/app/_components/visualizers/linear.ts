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
 * Linear visualizer implementation that draws the frequency spectrum as a line graph
 * This visualizer shows the audio spectrum in a continuous line form
 */
export const linearVisualizer: VisualizerMode = {
    id: 'linear',
    name: '線形周波数表示',
    description: '周波数スペクトラムを線で表示（低音→高音）',
    /**
     * Draws the linear frequency visualization
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

        // Set up the line style for the frequency spectrum
        ctx.lineWidth = config.lineWidth;
        ctx.strokeStyle = config.strokeStyle;
        ctx.beginPath();

        // Calculate the width of each segment
        const sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;

        // Draw the frequency spectrum as a continuous line
        for (let i = 0; i < bufferLength; i++) {
            // Normalize the value to canvas height (invert the value for bottom-up display)
            const v = 1 - (dataArray[i] / 255.0);
            const y = v * canvas.height;

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

        // Draw frequency range indicators
        ctx.font = '12px Arial';
        ctx.fillStyle = 'rgb(200, 200, 200)';
        ctx.textAlign = 'center';
        
        // 低音域のラベル
        ctx.fillText('低音域', canvas.width * 0.17, canvas.height - 5);
        // 中音域のラベル
        ctx.fillText('中音域', canvas.width * 0.5, canvas.height - 5);
        // 高音域のラベル
        ctx.fillText('高音域', canvas.width * 0.83, canvas.height - 5);
    },
}; 