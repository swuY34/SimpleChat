// components/Sidebar/index.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Modal, Input, theme, message as antdMessage } from 'antd';
import type { MenuProps } from 'antd';
import {
  PlusOutlined,
  UnorderedListOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

import { channelApi } from '../../api/channelApi'; // 你的频道接口

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

interface SidebarProps {
  collapsed: boolean;
  onChannelChange?: (name: string) => void;
}

const USER_ID = 'demo-user-id'; // 请改成登录后真实用户ID

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onChannelChange }) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const [channels, setChannels] = useState<string[]>([]);
  const [channelNames, setChannelNames] = useState<{ [key: string]: string }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [selectedKey, setSelectedKey] = useState<string>(''); // 选中的菜单 key

  // 取用户频道列表
  useEffect(() => {
    async function fetchChannels() {
      try {
        const { data } = await channelApi.getUserChannels(USER_ID);
        setChannels(data.map((ch) => ch.channelId));
        // 建立 channelId -> name 映射，方便菜单显示
        const map: { [key: string]: string } = {};
        data.forEach((ch) => (map[ch.channelId] = ch.channelName));
        setChannelNames(map);
        if (data.length > 0) {
          setSelectedKey(data[0].channelId);
          onChannelChange?.(data[0].channelName);
        }
      } catch {
        setChannels([]);
        antdMessage.error('获取频道列表失败');
      }
    }
    fetchChannels();
  }, [onChannelChange]);

  const handleAddChannel = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    const trimmed = newChannelName.trim();
    if (!trimmed) {
      antdMessage.warning('频道名称不能为空');
      return;
    }

    try {
      // 先判断是否已有同名频道
      let existChannel = Object.entries(channelNames).find(
        ([, name]) => name === trimmed,
      );
      let channelId = existChannel ? existChannel[0] : null;

      if (!channelId) {
        // 创建并加入频道
        const { data: created } = await channelApi.createChannel({ channelName: trimmed, userId: USER_ID });
        channelId = created.channelId;
      } else {
        // 加入频道
        await channelApi.joinChannel(channelId, { userId: USER_ID, channelName: trimmed });
      }

      // 刷新频道列表
      const { data } = await channelApi.getUserChannels(USER_ID);
      setChannels(data.map((ch) => ch.channelId));
      const map: { [key: string]: string } = {};
      data.forEach((ch) => (map[ch.channelId] = ch.channelName));
      setChannelNames(map);

      // 选中新频道
      setSelectedKey(channelId);
      onChannelChange?.(channelNames[channelId] || trimmed);

      setIsModalOpen(false);
      setNewChannelName('');
      antdMessage.success(`已加入频道「${trimmed}」`);
    } catch {
      antdMessage.error('加入频道失败');
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setNewChannelName('');
  };

  const handleChannelClick = (key: string) => {
    setSelectedKey(key);
    onChannelChange?.(channelNames[key]);
  };

  const channelListItems: MenuItem[] =
    channels.length > 0
      ? channels.map((channelId) =>
          getItem(channelNames[channelId] ?? '未知频道', channelId),
        )
      : [getItem('未加入任何频道', 'empty')];

  return (
    <>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        style={{ background: colorBgContainer }}
        className="flex flex-col h-full border-r border-gray-200"
      >
        {/* 顶部 Logo */}
        <div className="p-4 flex items-center justify-center h-16">
          {!collapsed ? (
            <h1 className="text-xl font-bold">SimpleChat</h1>
          ) : (
            <div className="text-xl font-bold">SC</div>
          )}
        </div>

        {/* 添加频道 */}
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[]}
          onClick={({ key }) => {
            if (key === 'add-channel') handleAddChannel();
          }}
          className="border-r-0"
          items={[
            {
              key: 'add-channel',
              icon: <PlusOutlined />,
              label: '添加频道',
            },
          ]}
        />

        {/* 频道列表 */}
        <div className="channel-list flex-1 h-2/3 min-h-0">
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={selectedKey ? [selectedKey] : []}
            onClick={({ key }) => {
              if (key !== 'empty' && key !== 'add-channel') {
                handleChannelClick(key);
              }
            }}
            className="border-r-0"
            items={[
              getItem(
                '频道列表',
                'channels',
                <UnorderedListOutlined />,
                channelListItems,
              ),
            ]}
          />
        </div>

        {/* 底部“关于我们” */}
        <div className="border-t shrink-0 mb-7">
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[]}
            onClick={({ key }) => {
              if (key === '3') console.log('点击关于我们');
            }}
            className="border-r-0"
            items={[
              {
                key: '3',
                icon: <InfoCircleOutlined />,
                label: '关于我们',
              },
            ]}
          />
        </div>
      </Sider>

      {/* 添加频道弹窗 */}
      <Modal
        title="添加频道"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="加入"
        cancelText="取消"
      >
        <Input
          placeholder="请输入频道名称"
          value={newChannelName}
          onChange={(e) => setNewChannelName(e.target.value)}
          onPressEnter={handleOk}
        />
      </Modal>
    </>
  );
};

export default Sidebar;
