import { linearVisualizer } from './linear';
import { circularVisualizer } from './circular';
import { VisualizerMode } from './types';

export const visualizers: VisualizerMode[] = [
    linearVisualizer,
    circularVisualizer,
];

export type { VisualizerMode, VisualizerConfig } from './types'; 