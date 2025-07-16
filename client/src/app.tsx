import React, { 
  useState, 
  useEffect, 
  useRef
} from 'react';
import { 
  Routes, 
  Route, 
  useNavigate,  // 添加 useNavigate 钩子
  Navigate     // 添加 Navigate 组件
} from 'react-router-dom';
import { Divider, Button, message as antdMessage } from 'antd';
import MessageBubble from './components/MessageBubble';
import './globalStyle/global.css';

import { channelApi, MessageDTO } from './api/channelApi';
import { ChatWebSocket, ChatMessage } from './api/chatApi';
import { userApi } from './api/userApi';
import AuthModal from './components/AuthModal';
import { getToken, clearToken } from './utils/token';
import AppLayout from './components/Layout';

const WS_URL = 'ws://localhost:8080/ws/chat';

const ChatPage = () => {
  const [channelName, setChannelName] = useState('SimpleChat');
  const [channelId, setChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState<string>('用户');
  const wsRef = useRef<ChatWebSocket | null>(null);
  const navigate = useNavigate(); // 使用导航钩子

  // 获取当前用户信息
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await userApi.getCurrentUser();
        setUsername(res.data.username);
      } catch (err) {
        antdMessage.error('获取用户信息失败');
        navigate('/login'); // 重定向到登录页
      }
    }

    fetchUser();
  }, [navigate]);

  // 加载频道和消息
  useEffect(() => {
    if (!channelName || channelName === 'SimpleChat') {
      setChannelId(null);
      setMessages([]);
      return;
    }

    async function loadChannel() {
      try {
        const userId = (await userApi.getCurrentUser()).data.userId;
        const { data: userChannels } = await channelApi.getUserChannels(userId);
        const channel = userChannels.find(c => c.channelName === channelName);

        let currentChannelId = channel?.channelId;
        if (!currentChannelId) {
          const { data: created } = await channelApi.createChannel({ channelName, userId });
          currentChannelId = created.channelId;
        }

        setChannelId(currentChannelId);
        await channelApi.joinChannel(currentChannelId, { userId, channelName });

        const { data: msgs } = await channelApi.getChannelMessages(currentChannelId);
        setMessages(msgs);
      } catch (err) {
        antdMessage.error('加载频道失败');
        setMessages([]);
        setChannelId(null);
      }
    }

    loadChannel();
  }, [channelName]);

  // 建立 WebSocket
  useEffect(() => {
    if (!channelId || !username) {
      wsRef.current?.disconnect();
      wsRef.current = null;
      return;
    }

    const ws = new ChatWebSocket({ username, url: `${WS_URL}/${channelId}` });
    ws.connect();

    ws.onSystemMessage((content) => {
      setMessages(prev => [...prev, {
        messageId: -1,
        sender: '系统',
        content,
        timestamp: new Date().toISOString(),
      }]);
    });

    ws.onChatMessage(({ sender, content }) => {
      setMessages(prev => [
        ...prev,
        {
          messageId: Date.now(),
          sender,
          content,
          timestamp: new Date().toISOString(),
        },
      ]);
    });

    wsRef.current = ws;

    return () => {
      ws.disconnect();
      wsRef.current = null;
    };
  }, [channelId, username]);

  const handleSendMessage = () => {
    if (!message.trim() || !wsRef.current) return;

    try {
      wsRef.current.sendMessage(message.trim());
      setMessage('');
    } catch {
      antdMessage.error('消息发送失败');
    }
  };

  const isDefault = channelName === 'SimpleChat';

  return (
    <div className="relative w-full h-full">
      {isDefault ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h1 className="text-2xl font-bold mb-4">欢迎使用 SimpleChat</h1>
          <p className="text-gray-600">请选择频道以开始交流。</p>
        </div>
      ) : (
        <>
          <div className="absolute top-0 left-0 w-full h-[75%] overflow-auto p-4 flex flex-col gap-2">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.messageId}
                username={msg.sender}
                avatarUrl=""
                message={msg.content}
                isSelf={msg.sender === username}
              />
            ))}
          </div>

          <div className="absolute bottom-0 left-0 w-full h-[25%] z-0 !pb-0 flex flex-col">
            <div className="h-full">
              <div className="py-4 bg-gray-100 rounded-md">
                <textarea
                  className="w-full h-20 resize-none px-7 text-base outline-none border-none bg-gray-100"
                  placeholder={`在「${channelName}」中输入消息...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
              </div>

              <div className="flex justify-end !pt-2 bg-white">
                <Button
                  type="primary"
                  className="!px-6 !py-1.5"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                >
                  发送
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  
  const handleLoginSuccess = () => {
    navigate('/chat');
  };

  return <AuthModal open={true} onSuccess={handleLoginSuccess} />;
};

const App: React.FC = () => {
  const [channelName, setChannelName] = useState('SimpleChat');
  const [username, setUsername] = useState('用户');
  const navigate = useNavigate(); // 使用导航钩子
  
  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  return (
    <AppLayout
      channelName={channelName}
      onChannelChange={setChannelName}
      username={username}
      onLogout={handleLogout}
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </AppLayout>
  );
};

export default App;