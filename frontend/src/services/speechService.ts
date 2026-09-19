/**
 * Browser Web Speech API service for Speech Recognition (STT) and Speech Synthesis (TTS).
 * Provides graceful fallbacks and safe permission handling.
 */

// Speech Recognition Type Definitions for browser compatibility
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface IWindowWithSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

/**
 * Check if the browser supports speech recognition.
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as IWindowWithSpeech;
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

/**
 * Check if the browser supports speech synthesis (text-to-speech).
 */
export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance !== 'undefined';
}

export interface RecognitionCallbacks {
  onStart?: () => void;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (errorMessage: string, isPermissionDenied?: boolean) => void;
  onEnd?: () => void;
}

let activeRecognitionInstance: any = null;

/**
 * Start listening for voice input from the microphone.
 */
export function startSpeechRecognition(callbacks: RecognitionCallbacks): () => void {
  if (!isSpeechRecognitionSupported()) {
    callbacks.onError?.('Voice input is not supported in this browser. You can type your question instead.');
    return () => {};
  }

  // Stop any active previous session
  stopSpeechRecognition();

  try {
    const win = window as IWindowWithSpeech;
    const SpeechClass = win.SpeechRecognition || win.webkitSpeechRecognition;
    const recognition = new SpeechClass();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      callbacks.onStart?.();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          finalTranscript += text;
        } else {
          interimTranscript += text;
        }
      }

      const currentText = finalTranscript || interimTranscript;
      callbacks.onResult(currentText, Boolean(finalTranscript));
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.warn('Speech recognition warning/error:', event.error);
      const isPermission = event.error === 'not-allowed' || event.error === 'service-not-allowed';
      let message = 'Voice input encountered an issue. You can continue by typing.';

      if (isPermission) {
        message = 'Microphone permission is required for voice input. You can continue by typing.';
      } else if (event.error === 'no-speech') {
        message = 'No speech was detected. Please tap the microphone and try speaking again.';
      } else if (event.error === 'network') {
        message = 'Network connection issue during speech recognition. Please type your question.';
      }

      callbacks.onError?.(message, isPermission);
    };

    recognition.onend = () => {
      activeRecognitionInstance = null;
      callbacks.onEnd?.();
    };

    recognition.start();
    activeRecognitionInstance = recognition;

    // Return cleanup function
    return () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unable to start speech recognition.';
    callbacks.onError?.(msg);
    return () => {};
  }
}

/**
 * Manually stop active speech recognition.
 */
export function stopSpeechRecognition(): void {
  if (activeRecognitionInstance) {
    try {
      activeRecognitionInstance.stop();
    } catch {
      // ignore
    }
    activeRecognitionInstance = null;
  }
}

/**
 * Text-to-Speech (TTS) handler
 */
export interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: string) => void;
}

/**
 * Read text aloud using SpeechSynthesis.
 */
export function speakText(text: string, options?: SpeakOptions): void {
  if (!isSpeechSynthesisSupported()) {
    options?.onError?.('Voice playback is not supported on this device.');
    return;
  }

  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Clean text of markdown asterisks/bullets for smoother speech
    const cleanText = text
      .replace(/[#*_`]/g, '')
      .replace(/•/g, ', ')
      .replace(/\n+/g, '. ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95; // Slightly slower, calm cadence for healthtech
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      options?.onStart?.();
    };

    utterance.onend = () => {
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis playback ended or errored:', e);
      options?.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Speech synthesis error:', err);
    options?.onError?.('Voice playback is unavailable.');
  }
}

/**
 * Stop any active text-to-speech output.
 */
export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Check if speech synthesis is currently speaking.
 */
export function isSpeaking(): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  return window.speechSynthesis.speaking;
}
