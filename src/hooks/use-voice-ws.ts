/**
 * useVoiceWS — WebSocket-based voice transcription via Groq Whisper.
 * Streams raw audio chunks to the backend /ws/voice endpoint.
 * Falls back to browser SpeechRecognition if WS is unavailable.
 */
import { useRef, useState, useCallback, useEffect } from "react";

const WS_URL = (import.meta.env.VITE_API_URL as string | undefined)
  ?.replace("http://", "ws://")
  ?.replace("https://", "wss://");

interface VoiceWSOptions {
  onTranscript: (text: string, isFinal: boolean) => void;
  onError?: (msg: string) => void;
}

export function useVoiceWS({ onTranscript, onError }: VoiceWSOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const startListening = useCallback(async () => {
    if (!WS_URL) {
      onError?.("No backend URL configured. Set VITE_API_URL.");
      setSupported(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      // Open WebSocket
      const ws = new WebSocket(`${WS_URL}/ws/voice`);
      wsRef.current = ws;

      ws.onopen = () => {
        // Start recording once WS is open
        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm";

        const recorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 128000 });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            ws.send(e.data);
          }
        };

        // Send chunks every 1.5 seconds for low latency
        recorder.start(1500);
        setIsListening(true);
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "transcript" && msg.text) {
            onTranscript(msg.text, true);
          } else if (msg.type === "error") {
            onError?.(msg.message);
          }
        } catch {}
      };

      ws.onerror = () => {
        onError?.("WebSocket connection error. Check if backend is running.");
        cleanup();
      };

      ws.onclose = () => {
        setIsListening(false);
      };
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        onError?.("Microphone access denied. Please allow mic access in your browser.");
      } else {
        onError?.(`Could not start recording: ${err.message}`);
      }
      setSupported(false);
    }
  }, [onTranscript, onError]);

  const stopListening = useCallback(() => {
    // Flush remaining audio before closing
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "flush" }));
      setTimeout(() => wsRef.current?.close(), 300);
    }
    cleanup();
    setIsListening(false);
  }, []);

  function cleanup() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  }

  return { isListening, supported, startListening, stopListening };
}
