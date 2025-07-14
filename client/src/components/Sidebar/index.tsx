import React from 'react'
import { Layout, Menu, theme } from 'antd'
import type { MenuProps } from 'antd'
import {
  PlusOutlined,
  UnorderedListOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'

const { Sider } = Layout

type MenuItem = Required<MenuProps>['items'][number]

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
  } as MenuItem
}

interface SidebarProps {
  collapsed: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  const sidebarItems: MenuItem[] = [
    getItem('添加频道', '1', <PlusOutlined />),
    getItem('频道列表', '2', <UnorderedListOutlined />),
  ]

  const bottomSidebarItems: MenuItem[] = [
    {
      type: 'divider',
    },
    getItem('关于我们', '3', <InfoCircleOutlined />),
  ]

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={250}
      style={{ background: colorBgContainer }}
      className="border-r border-gray-200 flex flex-col"
    >
      {/* Logo 区域 */}
      <div className="p-4 flex items-center justify-center h-16">
        {!collapsed ? (
          <h1 className="text-xl font-bold">频道管理</h1>
        ) : (
          <div className="text-xl font-bold">CM</div>
        )}
      </div>

      {/* 主菜单区域 */}
      <Menu
        theme="light"
        mode="inline"
        defaultSelectedKeys={['1']}
        items={sidebarItems}
        className="border-r-0 flex-1"
      />

      {/* 底部菜单区域 */}
      <Menu
        theme="light"
        mode="inline"
        items={bottomSidebarItems}
        className="border-r-0"
      />
    </Sider>
  )
}

export default Sidebar