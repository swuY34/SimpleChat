import axios, { AxiosResponse } from 'axios';

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
  createdBy?: any; // 按实际entity类型改
}

interface ChannelSummary {
  channelId: string;
  channelName: string;
}

export interface MessageDTO {
  messageId: number | string;
  sender: string;
  content: string;
  timestamp: string; // ISO 时间字符串
}

const baseUrl = 'http://localhost:8888/api/channels';

export const channelApi = {
  createChannel: (data: CreateChannelRequest): Promise<AxiosResponse<Channel>> =>
    axios.post<Channel>(baseUrl, data),

  joinChannel: (channelId: string, data: JoinChannelRequest): Promise<AxiosResponse<string>> =>
    axios.post(`${baseUrl}/${channelId}/join`, data),

  leaveChannel: (channelId: string, data: LeaveChannelRequest): Promise<AxiosResponse<string>> =>
    axios.delete(`${baseUrl}/${channelId}/leave`, { data }),

  deleteChannel: (channelId: string): Promise<AxiosResponse<string>> =>
    axios.delete(`${baseUrl}/${channelId}`),

  getUserChannels: (userId: string): Promise<AxiosResponse<ChannelSummary[]>> =>
    axios.get(`/api/users/${userId}/channels`),

  getChannelMessages: (channelId: string): Promise<AxiosResponse<MessageDTO[]>> =>
    axios.get(`${baseUrl}/${channelId}/messages`),
};
