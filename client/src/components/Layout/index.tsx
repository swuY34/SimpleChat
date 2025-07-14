import React, { useState } from 'react';
import { Layout, Button, theme, Avatar, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import Sidebar from '../Sidebar';

const { Header, Content } = Layout;

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
    key: '3',
    icon: <LogoutOutlined />,
    label: 'Logout',
  },
];

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout hasSider className="h-screen">
      <Sidebar collapsed={collapsed} />
      
      <Layout>
        <Header
          style={{ 
            background: colorBgContainer,
            padding: 0, // 清除默认padding
          }}
          className="flex items-center border-b"
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="w-16 h-16"
          />
          <span className="text-lg font-semibold">频道管理系统</span>
          
          <div className="ml-auto pr-4">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center cursor-pointer">
                <Avatar icon={<UserOutlined />} className="mr-2" />
                {!collapsed && <span className="font-medium">John Doe</span>}
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="m-4 p-6 bg-white rounded-lg min-h-[calc(100vh-64px-32px)]">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;