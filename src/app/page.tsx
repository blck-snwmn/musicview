'use client';

import { AudioUploader } from './components/AudioUploader';
import { AudioVisualizer } from './components/AudioVisualizer';
import { AudioProvider, useAudio } from './contexts/AudioContext';

function MainContent() {
  const { setAudioData, audioBuffer } = useAudio();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-8">
      <h1 className="text-3xl font-bold">Music Visualizer</h1>
      <AudioUploader onAudioLoad={setAudioData} />
      {audioBuffer && <AudioVisualizer />}
    </div>
  );
}

export default function Home() {
  return (
    <AudioProvider>
      <MainContent />
    </AudioProvider>
  );
}
