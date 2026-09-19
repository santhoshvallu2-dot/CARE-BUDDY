import React, { useState, useEffect } from 'react';
import { Volume2, Square } from 'lucide-react';
import { speakText, stopSpeaking, isSpeechSynthesisSupported } from '../../services/speechService';

interface ReadAloudButtonProps {
  text: string;
  className?: string;
}

export const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({
  text,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isSupported = isSpeechSynthesisSupported();

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  if (!isSupported || !text.trim()) {
    return null;
  }

  const handleToggle = () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakText(text, {
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isPlaying ? 'Stop reading aloud' : 'Read explanation aloud'}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
        isPlaying
          ? 'bg-coffee-800 text-warm-50 shadow-2xs animate-pulse'
          : 'bg-warm-100 text-coffee-800 hover:bg-warm-200 border border-warm-200/80'
      } ${className}`}
    >
      {isPlaying ? (
        <>
          <Square className="w-3 h-3" />
          <span>Stop</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-coffee-800" />
          <span>Read aloud</span>
        </>
      )}
    </button>
  );
};
