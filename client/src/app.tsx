import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { message as antdMessage } from 'antd';
import AuthModal from './components/AuthModal';
import { getToken, clearToken } from './utils/token';
import AppLayout from './components/Layout';
import ChatPage from './components/ChatPage';
import { userApi } from './api/userApi';
import './globalStyle/global.css';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/chat');
  };

  return <AuthModal open={true} onSuccess={handleLoginSuccess} />;
};

const App: React.FC = () => {
  const [channelInfo, setChannelInfo] = useState({
    channelId: null,
    channelName: 'SimpleChat'
  });
  const [username, setUsername] = useState('用户');
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (token) {
      const fetchUser = async () => {
        try {
          const res = await userApi.getCurrentUser();
          setUsername(res.data.user.username);
        } catch (err) {
          antdMessage.error('获取用户信息失败');
          setUsername('用户');
          setChannelInfo({
            channelId: null,
            channelName: 'SimpleChat'
          });
          navigate('/login');
        }
      };
      fetchUser();
    } else {
      setUsername('用户');
      setChannelInfo({
        channelId: null,
        channelName: 'SimpleChat'
      });
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    clearToken();
    setUsername('用户');
    setChannelInfo({
      channelId: null,
      channelName: 'SimpleChat'
    });
    navigate('/login');
  };

  return (
    <AppLayout
      channelInfo={channelInfo}
      onChannelChange={setChannelInfo}
      username={username}
      onLogout={handleLogout}
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/chat" 
          element={<ChatPage channelInfo={channelInfo} />} 
        />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </AppLayout>
  );
};

export default App;