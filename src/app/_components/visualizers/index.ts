import { linearVisualizer } from './linear';
import { circularVisualizer } from './circular';
import { frequencyVisualizer } from './frequency';
import { VisualizerMode } from './types';

export const visualizers: VisualizerMode[] = [
    linearVisualizer,
    circularVisualizer,
    frequencyVisualizer,
];

export type { VisualizerMode, VisualizerConfig } from './types'; 