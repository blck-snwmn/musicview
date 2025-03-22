import { VisualizerMode, VisualizerConfig, DrawArea } from './types';

const defaultConfig: Required<VisualizerConfig> & {
    borderColor: string;
    borderWidth: number;
    verticalPadding: number;
} = {
    lineWidth: 2,
    strokeStyle: 'rgb(100, 100, 255)',
    backgroundColor: 'rgb(20, 20, 20)',
    borderColor: 'rgb(40, 40, 80)',
    borderWidth: 1,
    verticalPadding: 0.1,
};

export const symmetricVisualizer: VisualizerMode = {
    id: 'symmetric',
    name: '対称表示',
    description: '周波数スペクトラムを中心線を基準に上下対称に表示',
    draw: (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, canvas: HTMLCanvasElement, drawArea: DrawArea) => {
        const config = { ...defaultConfig };
        const bufferLength = dataArray.length;

        // 描画領域の境界を表示
        ctx.strokeStyle = config.borderColor;
        ctx.lineWidth = config.borderWidth;
        ctx.strokeRect(drawArea.x, drawArea.y, drawArea.width, drawArea.height);

        // 実際の波形の描画領域を計算
        const effectiveHeight = drawArea.height * (1 - config.verticalPadding * 2);
        const waveformY = drawArea.y + (drawArea.height * config.verticalPadding);
        const centerY = waveformY + effectiveHeight / 2;

        // 中心線を描画
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
        ctx.moveTo(drawArea.x, centerY);
        ctx.lineTo(drawArea.x + drawArea.width, centerY);
        ctx.stroke();

        // Set up drawing styles for the waveform
        ctx.lineWidth = config.lineWidth;
        ctx.strokeStyle = config.strokeStyle;

        // Calculate the width of each segment
        const segmentWidth = drawArea.width / bufferLength;

        // Draw the frequency spectrum
        for (let i = 0; i < bufferLength; i++) {
            const x = drawArea.x + (i * segmentWidth);
            const value = dataArray[i] / 255.0;
            const halfHeight = (effectiveHeight / 2) * value;

            // Draw vertical line centered at centerY
            ctx.beginPath();
            ctx.moveTo(x, centerY - halfHeight);
            ctx.lineTo(x, centerY + halfHeight);
            ctx.stroke();
        }
    },
}; 