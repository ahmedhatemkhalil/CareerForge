import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import toast from "react-hot-toast";

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

const SPEECH_ERRORS = {
  "not-allowed":
    "Microphone access was denied. Please allow microphone permission in your browser.",
  "no-speech": "No speech detected. Try speaking again.",
  "audio-capture": "No microphone found. Please connect a microphone.",
  network: "Speech recognition requires an internet connection.",
};

const updateLiveTranscript = (setLiveTranscript, liveTranscriptRef, text) => {
  liveTranscriptRef.current = text;
  flushSync(() => setLiveTranscript(text));
};

export const useVoiceAnswer = ({ onRecordingComplete } = {}) => {
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechSupported] = useState(() => Boolean(SpeechRecognition));

  const recognitionRef = useRef(null);
  const isTranscribingRef = useRef(false);
  const sessionFinalRef = useRef("");
  const liveTranscriptRef = useRef("");
  const onRecordingCompleteRef = useRef(onRecordingComplete);

  const isSupported =
    isSpeechSupported &&
    typeof navigator?.mediaDevices?.getUserMedia === "function";

  useEffect(() => {
    onRecordingCompleteRef.current = onRecordingComplete;
  }, [onRecordingComplete]);

  useEffect(() => {
    if (!isSpeechSupported) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          sessionFinalRef.current += transcript;
        } else {
          interim += transcript;
        }
      }

      const combined = `${sessionFinalRef.current}${interim}`.trim();
      updateLiveTranscript(setLiveTranscript, liveTranscriptRef, combined);
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") return;

      const message =
        SPEECH_ERRORS[event.error] ||
        "Speech recognition failed. Please try again.";

      toast.error(message);
      isTranscribingRef.current = false;
      sessionFinalRef.current = "";
      setIsRecording(false);
      updateLiveTranscript(setLiveTranscript, liveTranscriptRef, "");
    };

    recognition.onend = () => {
      if (isTranscribingRef.current) {
        try {
          recognition.start();
        } catch {
          isTranscribingRef.current = false;
          sessionFinalRef.current = "";
          setIsRecording(false);
          updateLiveTranscript(setLiveTranscript, liveTranscriptRef, "");
        }
        return;
      }

      sessionFinalRef.current = "";
      updateLiveTranscript(setLiveTranscript, liveTranscriptRef, "");
    };

    recognitionRef.current = recognition;

    return () => {
      isTranscribingRef.current = false;
      recognition.stop();
    };
  }, [isSpeechSupported]);

  const resetSession = useCallback(() => {
    sessionFinalRef.current = "";
    updateLiveTranscript(setLiveTranscript, liveTranscriptRef, "");
  }, []);

  const startSpeechRecognition = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      resetSession();
      recognitionRef.current.start();
      isTranscribingRef.current = true;
      setIsRecording(true);
    } catch {
      toast.error("Could not start speech recognition.");
      setIsRecording(false);
    }
  }, [resetSession]);

  const stopSpeechRecognition = useCallback(() => {
    if (!recognitionRef.current) return;

    isTranscribingRef.current = false;
    setIsRecording(false);

    try {
      recognitionRef.current.stop();
    } catch {
      // already stopped
    }
  }, []);

  const commitTranscript = useCallback(() => {
    const text = liveTranscriptRef.current.trim();
    sessionFinalRef.current = "";
    updateLiveTranscript(setLiveTranscript, liveTranscriptRef, "");

    if (text) {
      onRecordingCompleteRef.current?.(text);
    }
  }, []);

  const startVoiceAnswer = useCallback(() => {
    if (!isSupported) {
      toast.error(
        "Voice answers are not supported in this browser. Try Chrome or Edge."
      );
      return;
    }

    startSpeechRecognition();
  }, [isSupported, startSpeechRecognition]);

  const stopVoiceAnswer = useCallback(() => {
    stopSpeechRecognition();
    commitTranscript();
  }, [stopSpeechRecognition, commitTranscript]);

  const toggleVoiceAnswer = useCallback(() => {
    if (isRecording) {
      stopVoiceAnswer();
    } else {
      startVoiceAnswer();
    }
  }, [isRecording, startVoiceAnswer, stopVoiceAnswer]);

  return {
    isRecording,
    isSupported,
    liveTranscript,
    startVoiceAnswer,
    stopVoiceAnswer,
    toggleVoiceAnswer,
  };
};
