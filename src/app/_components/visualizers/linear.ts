import { VisualizerMode, VisualizerConfig, DrawArea } from './types';

/**
 * Default configuration for the linear visualizer
 * These values can be customized if needed
 */
const defaultConfig: Required<VisualizerConfig> & {
    borderColor: string;
    borderWidth: number;
    verticalPadding: number; // 上下の余白（%）
} = {
    lineWidth: 2,
    strokeStyle: 'rgb(100, 100, 255)',
    backgroundColor: 'rgb(20, 20, 20)',
    borderColor: 'rgb(40, 40, 80)',
    borderWidth: 1,
    verticalPadding: 0.1, // 10%の余白
};

/**
 * Linear visualizer implementation that draws the frequency spectrum as a line graph
 * This visualizer shows the audio spectrum in a continuous line form
 */
export const linearVisualizer: VisualizerMode = {
    id: 'linear',
    name: '線形周波数表示',
    description: '周波数スペクトラムを線形で表示',
    /**
     * Draws the linear frequency visualization
     * @param ctx - Canvas rendering context
     * @param dataArray - Audio frequency data array (values 0-255)
     * @param canvas - Canvas element
     * @param drawArea - Draw area configuration
     */
    draw: (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, canvas: HTMLCanvasElement, drawArea: DrawArea) => {
        const config = { ...defaultConfig };
        const bufferLength = dataArray.length;

        // 描画領域の境界を表示
        ctx.strokeStyle = config.borderColor;
        ctx.lineWidth = config.borderWidth;
        ctx.strokeRect(drawArea.x, drawArea.y, drawArea.width, drawArea.height);

        // 実際の波形の描画領域を計算（上下に少し余白を持たせる）
        const effectiveHeight = drawArea.height * (1 - config.verticalPadding * 2);
        const waveformY = drawArea.y + (drawArea.height * config.verticalPadding);

        // Set up drawing styles for the waveform
        ctx.lineWidth = config.lineWidth;
        ctx.strokeStyle = config.strokeStyle;
        ctx.beginPath();

        // Calculate the width of each segment
        const segmentWidth = drawArea.width / (bufferLength - 1);

        // Draw the frequency spectrum
        for (let i = 0; i < bufferLength; i++) {
            const x = drawArea.x + (i * segmentWidth);
            const value = dataArray[i] / 255.0;
            // 波形の高さを調整して、余白を考慮した範囲内に収める
            const y = waveformY + effectiveHeight - (value * effectiveHeight);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        // Draw the line
        ctx.stroke();

        // Draw frequency range indicators
        ctx.font = '12px Arial';
        ctx.fillStyle = 'rgb(200, 200, 200)';
        ctx.textAlign = 'center';
        
        const labelY = drawArea.y + drawArea.height - 5;
        
        // 低音域のラベル
        ctx.fillText('低音域', drawArea.x + drawArea.width * 0.17, labelY);
        // 中音域のラベル
        ctx.fillText('中音域', drawArea.x + drawArea.width * 0.5, labelY);
        // 高音域のラベル
        ctx.fillText('高音域', drawArea.x + drawArea.width * 0.83, labelY);
    },
}; 