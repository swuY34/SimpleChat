import axios, { AxiosResponse } from 'axios';

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
  // 其他字段按需补充
}

// 创建 axios 实例，带 token 拦截器
const apiClient = axios.create({
  baseURL: 'http://localhost:8888/',
});

// 请求拦截器，自动在请求头加上 token
apiClient.interceptors.request.use((config) => {
  // 使用正确的键名 'auth_token'
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 添加响应拦截器以捕获错误详情 - 优化提取错误消息
apiClient.interceptors.response.use(
  response => response,
  error => {
    // 提取错误信息
    let errorMessage = '请求失败';
    
    if (error.response) {
      // 优先尝试从后端返回的JSON数据中提取message字段
      if (error.response.data && typeof error.response.data === 'object') {
        // 尝试提取后端返回的错误消息
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
    
    // 返回包含错误信息的自定义错误
    return Promise.reject(new Error(errorMessage));
  }
);

export const userApi = {
  register: (data: RegisterRequest): Promise<AxiosResponse<User>> =>
    apiClient.post<User>('/api/users/register', {
      username: data.username,
      email: data.email,
      password: data.password,
    }),

  login: (data: LoginRequest): Promise<AxiosResponse<{ token: string; user: User }>> =>
    apiClient.post<{ token: string; user: User }>('/api/users/login', data),

  changePassword: (data: ChangePasswordRequest): Promise<AxiosResponse<string>> =>
    apiClient.post<string>('/api/users/change-password', data),

  getUserById: (userId: string): Promise<AxiosResponse<User>> =>
    apiClient.get<User>(`/api/users/${userId}`),

  getCurrentUser: (): Promise<AxiosResponse<User>> =>
    apiClient.get<User>('/api/users/me'),
};