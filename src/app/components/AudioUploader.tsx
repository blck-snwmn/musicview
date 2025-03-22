'use client';

import { useState, useCallback } from 'react';

interface AudioUploaderProps {
    onAudioLoad: (audioContext: AudioContext, audioBuffer: AudioBuffer) => void;
}

export const AudioUploader = ({ onAudioLoad }: AudioUploaderProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setIsLoading(true);
            setError(null);

            console.log('Loading audio file:', file.name, 'Type:', file.type);

            // Create AudioContext
            const audioContext = new AudioContext();

            // Read file as ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();
            console.log('File loaded as ArrayBuffer, size:', arrayBuffer.byteLength);

            // Decode audio data
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            console.log('Audio decoded successfully:', {
                duration: audioBuffer.duration,
                numberOfChannels: audioBuffer.numberOfChannels,
                sampleRate: audioBuffer.sampleRate
            });

            onAudioLoad(audioContext, audioBuffer);
        } catch (err) {
            console.error('Error loading audio:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(`Failed to load audio file (${file.type}): ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [onAudioLoad]);

    return (
        <div className="w-full max-w-md mx-auto p-4">
            <label className="block w-full">
                <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-violet-50 file:text-violet-700
                        hover:file:bg-violet-100
                        disabled:opacity-50"
                    disabled={isLoading}
                />
            </label>
            {isLoading && (
                <p className="mt-2 text-sm text-blue-600">Loading audio file...</p>
            )}
            {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
                Supported formats: MP3, WAV, OGG, etc.
            </p>
        </div>
    );
}; 