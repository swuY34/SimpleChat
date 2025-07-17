export type ChatMessage = {
  sender: string;
  content: string;
};

export type SystemMessage = string;

type MessageEventPayload =
  | { type: 'SYSTEM'; content: SystemMessage }
  | { type: 'CHAT'; sender: string; content: string };

type Listener<T> = (msg: T) => void;

export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private readonly username: string;
  private readonly url: string;
  private systemListeners: Listener<SystemMessage>[] = [];
  private chatListeners: Listener<ChatMessage>[] = [];

  constructor(params: { username: string; url: string }) {
    this.username = params.username;
    this.url = params.url;
  }

  connect() {
    this.ws = new WebSocket(`${this.url}?username=${encodeURIComponent(this.username)}`);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const data: MessageEventPayload = JSON.parse(event.data);
        if (data.type === 'SYSTEM') {
          this.systemListeners.forEach(cb => cb(data.content));
        } else if (data.type === 'CHAT') {
          this.chatListeners.forEach(cb => cb({ sender: data.sender, content: data.content }));
        }
      } catch (error) {
        console.error('Invalid WebSocket message:', event.data);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    this.ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }

  sendMessage(content: string | object) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = typeof content === 'string' ? content : JSON.stringify(content);
      this.ws.send(message);
    } else {
      throw new Error('WebSocket is not open');
    }
  }

  onSystemMessage(cb: Listener<SystemMessage>) {
    this.systemListeners.push(cb);
  }

  onChatMessage(cb: Listener<ChatMessage>) {
    this.chatListeners.push(cb);
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }
}