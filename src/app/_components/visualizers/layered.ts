import { VisualizerMode, VisualizerConfig, DrawArea } from './types';

interface LayerConfig {
    color: string;
    startIndex: number;
    endIndex: number;
}

const defaultConfig: Required<VisualizerConfig> & {
    borderColor: string;
    borderWidth: number;
    verticalPadding: number;
    layers: LayerConfig[];
} = {
    lineWidth: 2,
    strokeStyle: 'rgb(100, 100, 255)',
    backgroundColor: 'rgb(20, 20, 20)',
    borderColor: 'rgb(40, 40, 80)',
    borderWidth: 1,
    verticalPadding: 0.1,
    layers: [
        {
            color: 'rgba(255, 100, 100, 0.5)', // 赤 (低音)
            startIndex: 0,
            endIndex: 0.3, // 30%
        },
        {
            color: 'rgba(100, 255, 100, 0.5)', // 緑 (中音)
            startIndex: 0.3,
            endIndex: 0.6, // 30-60%
        },
        {
            color: 'rgba(100, 100, 255, 0.5)', // 青 (高音)
            startIndex: 0.6,
            endIndex: 1.0, // 60-100%
        },
    ],
};

export const layeredVisualizer: VisualizerMode = {
    id: 'layered',
    name: 'レイヤー表示',
    description: '周波数帯域を分割して重ね合わせ表示',
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

        // 各レイヤーを描画
        config.layers.forEach(layer => {
            const startIdx = Math.floor(bufferLength * layer.startIndex);
            const endIdx = Math.floor(bufferLength * layer.endIndex);
            const layerLength = endIdx - startIdx;

            ctx.beginPath();
            ctx.strokeStyle = layer.color;
            ctx.fillStyle = layer.color;

            // 最初のポイントを設定
            const firstX = drawArea.x;
            const firstValue = dataArray[startIdx] / 255.0;
            const firstY = waveformY + effectiveHeight - (firstValue * effectiveHeight);
            ctx.moveTo(firstX, firstY);

            // 周波数データを線で結ぶ
            for (let i = 0; i <= layerLength; i++) {
                const dataIndex = startIdx + i;
                const x = drawArea.x + (drawArea.width * (i / layerLength));
                const value = dataArray[dataIndex] / 255.0;
                const y = waveformY + effectiveHeight - (value * effectiveHeight);
                ctx.lineTo(x, y);
            }

            // 下部を閉じて塗りつぶす
            ctx.lineTo(drawArea.x + drawArea.width, waveformY + effectiveHeight);
            ctx.lineTo(drawArea.x, waveformY + effectiveHeight);
            ctx.closePath();
            ctx.fill();
        });
    },
}; 