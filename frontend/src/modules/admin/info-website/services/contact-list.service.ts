import axios from 'axios';

export interface IContactList {
  _id: string;
  logo?: string;
  map?: string;
  favicon?: string;
  facebook?: string;
  name?: string;
  mst?: string;
  date_start?: string;
  company_name?: string;
  youtube?: string;
  phone?: string;
  website?: string;
  zalo?: string;
  whatsapp?: string;
  hotline?: string;
  twitter?: string;
  telegram?: string;
  instagram?: string;
  email?: string;
  address?: string;
  description?: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateContactListDto = Omit<IContactList, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateContactListDto = Partial<CreateContactListDto>;

import { config } from "@/config/config";
import { API_URL_CLIENT } from "@/config/apiRoutes";
const BASE_URL = API_URL_CLIENT + config.ROUTES.INFO_WEBSITE.BASE;

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
});

// Add request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const ContactListService = {
  getAll: async (): Promise<IContactList[]> => {
    const { data } = await api.get('');
    return data;
  },

  getActive: async (): Promise<IContactList[]> => {
    const { data } = await api.get('/active');
    return data;
  },

  getById: async (id: string): Promise<IContactList> => {
    const { data } = await api.get(`/${id}`);
    return data;
  },

  create: async (createDto: CreateContactListDto): Promise<IContactList> => {
    const { data } = await api.post('', createDto);
    return data;
  },

  update: async (id: string, updateDto: UpdateContactListDto): Promise<IContactList> => {
    const { data } = await api.patch(`/${id}`, updateDto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/${id}`);
  },
};
