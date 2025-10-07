/* ========================= src/utils/useWebSocket.js (Logic Only) ========================= */
import { useEffect, useState } from 'react';

const WS_BASE_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080').replace('http', 'ws');

export default function useWebSocket(topic) {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!topic) return;

    const url = `${WS_BASE_URL}/ws/${topic}`;
    const ws = new WebSocket(url);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessage(data);
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    ws.onopen = () => {
      console.log(`WebSocket connected to ${topic}`);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log(`WebSocket disconnected from ${topic}`);
    };

    return () => {
      ws.close();
    };
  }, [topic]);

  return message;
}