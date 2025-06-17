import axios from 'axios';
import {
  VietQRConfig,
  CreateVietQRConfigDto,
  UpdateVietQRConfigDto,
} from '../models/vietqr-config';

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL + '/vietqr-configapi';

export const vietQRConfigService = {
  getAll: async (): Promise<VietQRConfig[]> => {
    const token = getToken();
    const response = await axios.get(`${API_URL}/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getActive: async (): Promise<VietQRConfig | null> => {
    const token = getToken();
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  create: async (data: CreateVietQRConfigDto): Promise<VietQRConfig> => {
    const token = getToken();
    const response = await axios.post(API_URL, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  update: async (id: string, data: UpdateVietQRConfigDto): Promise<VietQRConfig> => {
    const token = getToken();
    const response = await axios.put(`${API_URL}/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  setActive: async (id: string): Promise<VietQRConfig> => {
    const token = getToken();
    const response = await axios.put(`${API_URL}/${id}/activate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};