import axios, { AxiosResponse } from 'axios';
import { API_BASE_URL } from '../config/config';

interface CreateChannelRequest {
  userId: string;
  channelName: string;
}

interface JoinChannelRequest {
  userId: string;
  channelName: string;
}

interface LeaveChannelRequest {
  userId: string;
}

interface Channel {
  channelId: string;
  channelName: string;
  createdBy?: any;
}

interface ChannelSummary {
  channelId: string;
  channelName: string;
}

export interface MessageDTO {
  messageId: number | string;
  sender: string;
  content: string;
  timestamp: string;
}

const baseUrl = `${API_BASE_URL}/channels`;

export const channelApi = {
  createChannel: (data: CreateChannelRequest): Promise<AxiosResponse<Channel>> =>
    axios.post<Channel>(baseUrl, data),

  // 修复1：移除 channelId 参数，使用新的 /join 接口
  joinChannel: (data: JoinChannelRequest): Promise<AxiosResponse<Channel>> =>
    axios.post<Channel>(`${baseUrl}/join`, data),

  // 修复2：调整 leaveChannel 参数顺序
  leaveChannel: (channelId: string, data: LeaveChannelRequest): Promise<AxiosResponse<string>> =>
    axios.delete(`${baseUrl}/${channelId}/leave`, { data }),

  deleteChannel: (channelId: string): Promise<AxiosResponse<string>> =>
    axios.delete(`${baseUrl}/${channelId}`),

  getUserChannels: (userId: string): Promise<AxiosResponse<ChannelSummary[]>> =>
    axios.get(`${API_BASE_URL}/users/${userId}/channels`),

  getChannelMessages: (channelId: string): Promise<AxiosResponse<MessageDTO[]>> =>
    axios.get(`${baseUrl}/${channelId}/messages`),
};