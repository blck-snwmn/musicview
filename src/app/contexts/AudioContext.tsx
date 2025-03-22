'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AudioContextType {
    audioContext: AudioContext | null;
    audioBuffer: AudioBuffer | null;
    setAudioData: (context: AudioContext, buffer: AudioBuffer) => void;
}

const AudioContext = createContext<AudioContextType>({
    audioContext: null,
    audioBuffer: null,
    setAudioData: () => { },
});

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

    const setAudioData = (context: AudioContext, buffer: AudioBuffer) => {
        // Clean up previous context if it exists
        if (audioContext) {
            audioContext.close();
        }
        setAudioContext(context);
        setAudioBuffer(buffer);
    };

    return (
        <AudioContext.Provider value={{ audioContext, audioBuffer, setAudioData }}>
            {children}
        </AudioContext.Provider>
    );
}; 