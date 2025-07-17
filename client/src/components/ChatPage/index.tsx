import React, { useState, useEffect, useRef } from 'react';
import { Button, message as antdMessage } from 'antd';
import MessageBubble from '../MessageBubble';
import { channelApi, MessageDTO } from '../../api/channelApi';
import { userApi } from '../../api/userApi';
import { getToken } from '../../utils/token';
import { ChatWebSocket } from '../../api/chatApi';
import { WS_BASE_URL } from '../../config/config';

const WS_URL = `${WS_BASE_URL}/chat`;

interface ChatPageProps {
  channelName: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ channelName }) => {
  const [channelId, setChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState<string>('用户');
  const [userId, setUserId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const wsRef = useRef<ChatWebSocket | null>(null);

  // 获取当前用户信息
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setUsername('用户');
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await userApi.getCurrentUser();
        setUsername(res.data.user.username);
        setUserId(res.data.user.userId);
      } catch (err) {
        antdMessage.error('获取用户信息失败');
        setUsername('用户');
      }
    };

    fetchUser();
  }, []);

  // 处理频道变更
  useEffect(() => {
    const loadChannel = async () => {
      if (!userId) return;

      try {
        const { data: userChannels } = await channelApi.getUserChannels(userId);
        const channel = userChannels.find(ch => ch.channelName === channelName);

        if (!channel) {
          antdMessage.error(`找不到频道: ${channelName}`);
          return;
        }

        setChannelId(channel.channelId);

        // 获取频道消息历史
        const { data: msgs } = await channelApi.getChannelMessages(channel.channelId);
        setMessages(msgs);

        // 初始化WebSocket连接
        setupWebSocket(channel.channelId);
      } catch (error) {
        console.error('加载频道失败:', error);
        antdMessage.error('加载频道失败: ' + (error as any).message);
        setMessages([]);
        setChannelId(null);
        setConnectionStatus('disconnected');
      }
    };

    if (channelName && channelName !== 'SimpleChat') {
      loadChannel();
    } else {
      disconnectWebSocket();
      setChannelId(null);
      setMessages([]);
    }

    return () => {
      disconnectWebSocket();
    };
  }, [channelName, userId]);

  // 设置WebSocket连接
  const setupWebSocket = (channelId: string) => {
    disconnectWebSocket();
    setConnectionStatus('connecting');

    const ws = new ChatWebSocket({
      username,
      url: `${WS_URL}/${channelId}`
    });

    ws.connect();

    ws.onOpen(() => {
      console.log('WebSocket连接成功');
      setConnectionStatus('connected');
      antdMessage.success('已连接到聊天服务器');
    });

    ws.onError(() => {
      console.error('WebSocket连接错误');
      setConnectionStatus('disconnected');
      antdMessage.error('连接失败');
    });

    ws.onSystemMessage((content) => {
      setMessages(prev => [...prev, {
        messageId: Date.now(),
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

    // 添加超时检查
    const timeout = setTimeout(() => {
      if (connectionStatus === 'connecting') {
        antdMessage.warning('连接超时，请检查网络');
        setConnectionStatus('disconnected');
      }
    }, 5000);

    return () => clearTimeout(timeout);
  };

  // 断开WebSocket连接
  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
      setConnectionStatus('disconnected');
    }
  };

  // 发送消息处理
  const handleSendMessage = () => {
    if (!message.trim()) {
      antdMessage.warning('消息不能为空');
      return;
    }
    
    if (!wsRef.current || connectionStatus !== 'connected' || !channelId) {
      antdMessage.error('未连接到聊天服务器');
      return;
    }

    try {
      const messageObj = {
        type: "CHAT",
        content: message.trim(),
        channelId: channelId,
        sender: username
      };

      wsRef.current.sendMessage(messageObj);
      setMessage('');
    } catch (error) {
      console.error('消息发送失败:', error);
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
                  disabled={!message.trim() || connectionStatus !== 'connected'}
                  loading={connectionStatus === 'connecting'}
                >
                  {connectionStatus === 'connected' ? '发送' : 
                   connectionStatus === 'connecting' ? '连接中...' : '未连接'}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatPage;