import axios, { AxiosResponse } from 'axios';
import { API_BASE_URL } from '../config/config';

// 请求数据和返回数据的接口定义
interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface ChangePasswordRequest {
  username: string;
  oldPassword: string;
  newPassword: string;
}

interface User {
  userId: string;
  username: string;
  email: string;
  createdAt: string;
  channelMembers: any[];  // 根据实际情况填写类型
  sentMessages: any[];    // 根据实际情况填写类型
  version: number;
}

interface UserResponse {
  success: boolean;
  user: User;  // 假设返回的字段是 user
}

// 创建 axios 实例，带 token 拦截器
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/users`,
});

// 请求拦截器，自动在请求头加上 token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 添加响应拦截器以捕获错误详情
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = '请求失败';

    if (error.response) {
      // 优先尝试从后端返回的 JSON 数据中提取 message 字段
      if (error.response.data && typeof error.response.data === 'object') {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } 
      // 如果是纯文本响应
      else if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      }
      // 根据状态码设置默认错误消息
      else {
        switch (error.response.status) {
          case 401:
            errorMessage = '用户名或密码错误';
            break;
          case 400:
            errorMessage = '请求参数错误';
            break;
          default:
            errorMessage = `请求失败，状态码：${error.response.status}`;
        }
      }
    } else if (error.request) {
      errorMessage = '无法连接到服务器';
    }

    // 返回自定义错误信息
    return Promise.reject(new Error(errorMessage));
  }
);

// API 封装
export const userApi = {
  register: (data: RegisterRequest): Promise<AxiosResponse<User>> =>
    apiClient.post<User>('/register', {
      username: data.username,
      email: data.email,
      password: data.password,
    }),

  login: (data: LoginRequest): Promise<AxiosResponse<{ token: string; user: User }>> =>
    apiClient.post<{ token: string; user: User }>('/login', data),

  changePassword: (data: ChangePasswordRequest): Promise<AxiosResponse<string>> =>
    apiClient.post<string>('/change-password', data),

  getUserById: (userId: string): Promise<AxiosResponse<User>> =>
    apiClient.get<User>(`/${userId}`),

  getCurrentUser: (): Promise<AxiosResponse<UserResponse>> =>
    apiClient.get<UserResponse>('/me'),
};
