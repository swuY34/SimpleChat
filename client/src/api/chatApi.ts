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
  private openListeners: Listener<Event>[] = [];
  private errorListeners: Listener<Event>[] = [];

  constructor(params: { username: string; url: string }) {
    this.username = params.username;
    this.url = params.url;
  }

  connect() {
    const fullUrl = `${this.url}?username=${encodeURIComponent(this.username)}`;
    console.log('Connecting to WebSocket:', fullUrl);
    this.ws = new WebSocket(fullUrl);

    this.ws.onopen = (event) => {
      console.log('WebSocket connected');
      this.openListeners.forEach(cb => cb(event));
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

    this.ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      this.errorListeners.forEach(cb => cb(event));
    };
  }

  sendMessage(content: string | object) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = typeof content === 'string' ? content : JSON.stringify(content);
      console.log('Sending message:', message);
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

  onOpen(cb: Listener<Event>) {
    this.openListeners.push(cb);
  }

  onError(cb: Listener<Event>) {
    this.errorListeners.push(cb);
  }

  disconnect() {
    if (this.ws) {
      console.log('Disconnecting WebSocket');
      this.ws.close();
      this.ws = null;
    }
  }
}