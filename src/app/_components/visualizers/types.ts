/**
 * Visualizer mode interface that defines the structure of a visualizer.
 * Each visualizer must implement this interface to be compatible with the system.
 */
export type VisualizerMode = {
    /** Unique identifier for the visualizer */
    id: string;
    /** Display name of the visualizer in Japanese */
    name: string;
    /** Description of what the visualizer does in Japanese */
    description: string;
    /**
     * Draw function that handles the visualization
     * @param ctx - The 2D rendering context for the canvas
     * @param dataArray - Audio data array from the analyzer node (values range from 0-255)
     * @param canvas - The canvas element being drawn on
     */
    draw: (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, canvas: HTMLCanvasElement) => void;
};

/**
 * Common configuration interface for visualizers.
 * Defines the basic styling options that all visualizers can use.
 */
export interface VisualizerConfig {
    /** Width of the lines being drawn (default: 2) */
    lineWidth?: number;
    /** Color of the lines being drawn (default: rgb(100, 100, 255)) */
    strokeStyle?: string;
    /** Background color of the canvas (default: rgb(20, 20, 20)) */
    backgroundColor?: string;
} 