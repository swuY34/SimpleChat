import React, { useState, useEffect } from 'react';
import { Layout, Button, theme, Avatar, Dropdown, message, } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';
import Sidebar from '../Sidebar';
import { userApi } from '../../api/userApi';
import { getToken, clearToken } from '../../utils/token';

const { Header, Footer, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
  channelName: string;
  onChannelChange: (name: string) => void;
  username: string;
  onLogout: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  channelName,
  onChannelChange,
  username,
  onLogout,
}) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarKey, setSidebarKey] = useState(0);

  const {
    token: { colorBgContainer = '#fff' },
  } = theme.useToken();

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const token = getToken();
        if (!token) {
          setCurrentUserId(null);
          return;
        }

        const { data } = await userApi.getCurrentUser();
        if (data?.user?.userId) {
          setCurrentUserId(data.user.userId);
        } else {
          setCurrentUserId(null);
          message.error('获取用户信息失败');
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        setCurrentUserId(null);
        message.error('获取用户信息失败');
      }
    }

    fetchCurrentUser();
  }, [username]);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      clearToken();
      setCurrentUserId(null);
      setSidebarKey(prev => prev + 1);
      onLogout();
    }

    if (key === 'exit') {
      clearToken();
      setCurrentUserId(null);
      setSidebarKey(prev => prev + 1);
      window.electronAPI?.windowControl?.('close');
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: '2',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
    },
    {
      type: 'divider',
    },
    {
      key: 'exit',
      icon: <PoweroffOutlined />,
      label: 'Exit',
    },
  ];

  return (
    <Layout hasSider className="efagaegaeg h-screen overflow-visible">
      <Sidebar
        key={sidebarKey}
        collapsed={collapsed}
        onChannelChange={onChannelChange}
        currentUserId={currentUserId}
      />
      <Layout>
        <Header
          style={{
            background: colorBgContainer,
            padding: 0,
          }}
          className="drag-region flex items-center border-b"
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="!w-13 h-16"
          />
          <span className="text-lg font-semibold">{channelName}</span>
          <div className="ml-auto pr-4 mr-6">
            <Dropdown menu={{ items: userMenuItems, onClick: handleMenuClick }} placement="bottomRight">
              <div className="flex items-center cursor-pointer">
                <Avatar icon={<UserOutlined />} className="mr-2" />
                {!collapsed && <span className="font-medium">{username}</span>}
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="flex-1 m-4 mt-3 mb-8 p-6 bg-white rounded-lg overflow-auto">{children}</Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;