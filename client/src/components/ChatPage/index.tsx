import React, { useState, useEffect, useRef } from 'react';
import { Button, message as antdMessage } from 'antd';
import MessageBubble from '../MessageBubble';
import { channelApi, MessageDTO } from '../../api/channelApi';
import { userApi } from '../../api/userApi';
import { getToken } from '../../utils/token';
import { ChatWebSocket } from '../../api/chatApi';

const WS_URL = 'ws://localhost:8080/ws/chat';

interface ChatPageProps {
  channelName: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ channelName }) => {
  const [channelId, setChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState<string>('用户');
  const wsRef = useRef<ChatWebSocket | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setUsername('用户');
      return;
    }

    async function fetchUser() {
      try {
        const res = await userApi.getCurrentUser();
        setUsername(res.data.user.username);
      } catch (err) {
        antdMessage.error('获取用户信息失败');
        setUsername('用户');
      }
    }

    fetchUser();
  }, []);

  useEffect(() => {
    // 处理频道变更逻辑
    async function loadChannel() {
        if (!username || username === '用户') return;
        
        try {
        // 获取当前用户ID
        const userId = (await userApi.getCurrentUser()).data.user.userId;
        
        // 直接获取频道信息，不再调用 joinChannel
        const { data: userChannels } = await channelApi.getUserChannels(userId);
        const channel = userChannels.find(ch => ch.channelName === channelName);
        
        if (!channel) {
            antdMessage.error(`找不到频道: ${channelName}`);
            return;
        }

        setChannelId(channel.channelId);
        
        // 获取该频道的消息
        const { data: msgs } = await channelApi.getChannelMessages(channel.channelId);
        setMessages(msgs);
        
        // 设置WebSocket
        setupWebSocket(channel.channelId);
        } catch (error) {
        antdMessage.error('加载频道失败: ' + (error as any).message);
        setMessages([]);
        setChannelId(null);
        }
    }

    if (channelName && channelName !== 'SimpleChat') {
        loadChannel();
    } else {
        // 默认频道处理
        if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
        }
        setChannelId(null);
        setMessages([]);
    }
    }, [channelName, username]);

  // 提取WebSocket设置逻辑
  const setupWebSocket = (channelId: string) => {
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
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
    };
  };

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

export default ChatPage;