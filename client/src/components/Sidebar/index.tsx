import React, { useState, useEffect } from 'react';
import { Layout, Menu, Modal, Input, theme, message as antdMessage } from 'antd';
import type { MenuProps } from 'antd';
import {
  PlusOutlined,
  UnorderedListOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

import { channelApi } from '../../api/channelApi';
import { userApi } from '../../api/userApi';
import { getToken } from '../../utils/token';

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
  currentUserId: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onChannelChange, currentUserId }) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const [channels, setChannels] = useState<string[]>([]);
  const [channelNames, setChannelNames] = useState<{ [key: string]: string }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 在 useEffect 中修改这部分代码
  useEffect(() => {
    async function fetchChannels() {
      if (!currentUserId) {
        setChannels([]);
        setChannelNames({});
        setSelectedKey('');
        return; // 移除了默认打开频道的逻辑
      }

      try {
        setLoading(true);
        const { data } = await channelApi.getUserChannels(currentUserId);
        setChannels(data.map((ch) => ch.channelId));

        const map: { [key: string]: string } = {};
        data.forEach((ch) => (map[ch.channelId] = ch.channelName));
        setChannelNames(map);

        // 不再自动选择任何频道
        setSelectedKey('');
      } catch (error) {
        console.error('获取频道列表失败:', error);
        setChannels([]);
        setChannelNames({});
        setSelectedKey('');
        antdMessage.error('获取频道列表失败');
      } finally {
        setLoading(false);
      }
    }

    fetchChannels();
  }, [currentUserId]);

  const handleAddChannel = () => {
    if (!currentUserId) {
      antdMessage.error('请先登录以添加频道');
      return;
    }
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    if (!currentUserId) {
      antdMessage.error('用户未登录，无法添加频道');
      return;
    }

    const trimmed = newChannelName.trim();
    if (!trimmed) {
      antdMessage.warning('频道名称不能为空');
      return;
    }

    try {
      setLoading(true);
      const { data: channel } = await channelApi.joinChannel({
        userId: currentUserId,
        channelName: trimmed,
      });

      const { data } = await channelApi.getUserChannels(currentUserId);
      setChannels(data.map((ch) => ch.channelId));

      const newMap: { [key: string]: string } = {};
      data.forEach((ch) => (newMap[ch.channelId] = ch.channelName));
      setChannelNames(newMap);

      setSelectedKey(channel.channelId);
      onChannelChange?.(channel.channelName);

      setIsModalOpen(false);
      setNewChannelName('');
      antdMessage.success(`已加入频道「${trimmed}」`);
    } catch (error) {
      antdMessage.error('加入频道失败: ' + (error as any).message);
      console.error('加入频道失败:', error);
    } finally {
      setLoading(false);
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
        <div className="p-4 flex items-center justify-center h-16">
          {!collapsed ? (
            <h1 className="text-xl font-bold">SimpleChat</h1>
          ) : (
            <div className="text-xl font-bold">SC</div>
          )}
        </div>

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

      <Modal
        title="添加频道"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="加入"
        cancelText="取消"
        confirmLoading={loading}
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