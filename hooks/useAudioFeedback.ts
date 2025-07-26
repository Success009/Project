import { useState, useEffect, useCallback } from 'react';

export const useAudioFeedback = () => {
    const [isAudioEnabled, setIsAudioEnabled] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('audioEnabled');
            // Default to true if not set
            return saved !== null ? JSON.parse(saved) : true;
        }
        return true;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('audioEnabled', JSON.stringify(isAudioEnabled));
        }
    }, [isAudioEnabled]);

    const toggleAudio = useCallback(() => {
        setIsAudioEnabled(prev => !prev);
    }, []);

    const speak = useCallback((text: string) => {
        if (!isAudioEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
            return;
        }
        // Cancel any previous speech to avoid overlap
        window.speechSynthesis.cancel();
        
        // Use a modern regex with Unicode property escapes to reliably remove emojis.
        const emojiRegex = /\p{Emoji}/gu;
        const cleanText = text.replace(emojiRegex, '').replace(/\s\s+/g, ' ').trim();
        
        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        window.speechSynthesis.speak(utterance);
    }, [isAudioEnabled]);

    const vibrate = useCallback((pattern: number | number[]) => {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }, []);

    return { isAudioEnabled, toggleAudio, speak, vibrate };
};