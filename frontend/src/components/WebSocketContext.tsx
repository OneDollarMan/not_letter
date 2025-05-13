import React, { createContext, useEffect, useState, ReactNode, useContext } from 'react';

interface PaintLetterEvent {
  type: string;
  payload: {
    x: number;
    y: number;
  }
}

interface sendMapEvent {
  type: string;
  payload: [
    {
      x: number;
      y: number;
    }
  ]
}

interface WebSocketContextType {
  sendPaintLetterEvent: (x: number, y: number) => void;
  isConnected: boolean;
  mapData: sendMapEvent;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [mapData, setMapData] = useState<sendMapEvent>(null)

  useEffect(() => {
    // Подключение к WebSocket серверу
    const ws = new WebSocket('ws://localhost:8765');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    };

    ws.onmessage = (event: MessageEvent) => {
      const data: any = JSON.parse(event.data);
      console.log('Received message:', data);
      if (data.type == "sendMap") {
        setMapData(data)
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    };

    ws.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
    };

    setSocket(ws);

    // Очистка при размонтировании компонента
    return () => {
      ws.close();
    };
  }, []);

  const sendPaintLetterEvent = (x: number, y: number) => {
    if (socket && isConnected) {
      const message: PaintLetterEvent = {
        type: 'paintLetter',
        payload: {
          x,
          y,
        }
      };

      socket.send(JSON.stringify(message));
      console.log(`Sent paintLetter event with coordinates: x=${x}, y=${y}`);
    } else {
      console.log('Not connected to WebSocket');
    }
  };

  return (
    <WebSocketContext.Provider value={{ sendPaintLetterEvent, isConnected, mapData }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Создаем хук для использования WebSocket контекста
const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export { WebSocketProvider, useWebSocket };
