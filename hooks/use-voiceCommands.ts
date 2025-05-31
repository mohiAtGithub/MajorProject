import { useEffect } from 'react';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const useVoiceCommands = (onCommand: (command: string) => void, isActive: boolean) => {
  useEffect(() => {
    if (!isActive) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {  // <-- typed as any
      const lastResult = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log("🎤 Command heard:", lastResult);
      onCommand(lastResult);
    };

    recognition.onerror = (event: any) => {  // <-- typed as any
      console.error("Voice recognition error:", event.error);
    };

    recognition.start();

    return () => recognition.stop();
  }, [onCommand, isActive]);
};

export default useVoiceCommands;