import React, { useState } from 'react';
import { Modal, Tabs, Form, Input, Button, message } from 'antd';
import { userApi } from '../../api/userApi';
import { setToken } from '../../utils/token';
import { PoweroffOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  open: boolean;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onSuccess }) => {
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null); // 添加登录错误状态
  const [registerError, setRegisterError] = useState<string | null>(null); // 添加注册错误状态
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // 切换标签时清除错误信息
  const handleTabChange = (key: string) => {
    setTab(key);
    setLoginError(null);
    setRegisterError(null);
    form.resetFields();
  };

  const handleRegister = async (values: any) => {
    setLoading(true);
    setRegisterError(null); // 清除之前的注册错误
    try {
      await userApi.register(values);
      message.success('注册成功，请登录');
      setTab('login');
      form.resetFields();
    } catch (err: any) {
      // 设置注册错误信息
      setRegisterError(err.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (values: any) => {
    setLoading(true);
    setLoginError(null); // 清除之前的登录错误
    try {
      const { data } = await userApi.login(values);
      setToken(data.token);
      message.success('登录成功');
      onSuccess();
    } catch (err: any) {
      // 设置登录错误信息
      setLoginError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex justify-between items-center">
          <span>欢迎使用 SimpleChat</span>
          <Button
            type="text"
            icon={<PoweroffOutlined style={{ fontSize: 20 }} />}
            onClick={() => window.electronAPI?.windowControl?.('close')}
          />
        </div>
      }
      open={open}
      footer={null}
      closable={false}
      width={360}
      style={{ top: '12%' }} // 添加这一行
      onCancel={() => {
        setLoginError(null);
        setRegisterError(null);
      }}
    >
      <Tabs activeKey={tab} onChange={handleTabChange} centered>
        <Tabs.TabPane tab="登录" key="login">
          <Form onFinish={handleLogin} layout="vertical">
            {/* 显示登录错误信息 */}
            {loginError && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 rounded text-center">
                {loginError}
              </div>
            )}
            
            <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item className="text-right">
              <Button type="primary" htmlType="submit" loading={loading} className="w-full">
                登录
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>

        <Tabs.TabPane tab="注册" key="register">
          <Form form={form} onFinish={handleRegister} layout="vertical">
            {/* 显示注册错误信息 */}
            {registerError && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 rounded text-center">
                {registerError}
              </div>
            )}
            
            <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="邮箱" rules={[{ required: true, message: '请输入邮箱', type: 'email' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="确认密码"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item className="text-right">
              <Button type="primary" htmlType="submit" loading={loading} className="w-full">
                注册
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
};

export default AuthModal;