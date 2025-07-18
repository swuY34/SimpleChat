import axios, { AxiosResponse } from 'axios';
import { API_BASE_URL } from '../config/config';

const baseUrl = `${API_BASE_URL}/messages`;

export interface MessageDTO {
  messageId: number | string;
  sender: string;
  content: string;
  timestamp: string;
}

export const messageApi = {
  getChannelMessages: (channelId: string): Promise<AxiosResponse<MessageDTO[]>> =>
    axios.get(`${baseUrl}/channel/${channelId}`),
};