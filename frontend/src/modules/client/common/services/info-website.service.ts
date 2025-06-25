import axios from 'axios';

export interface IContactList {
  _id: string;
  logo?: string;
  map?: string;
  favicon?: string;
  name?: string;
  mst?: string;
  date_start?: string;
  company_name?: string;
  youtube?: string;
  facebook?: string;
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

// Add token to headers if exists
const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const ContactListService = {
  getAll: async (): Promise<IContactList[]> => {
    const { data } = await axios.get(`${BASE_URL}`, {
      headers: getAuthHeaders(),
    });
    return data;
  },

  // Sửa lại hàm getActive để đúng endpoint (không thêm /active vào BASE_URL vì BASE_URL đã là /info-websitesapi)
  getActive: async (): Promise<IContactList | null> => {
    try {
      // Đúng endpoint: /info-websitesapi/active
      const { data } = await axios.get(
        API_URL_CLIENT + config.ROUTES.INFO_WEBSITE.GET_ACTIVE,
        {
          headers: getAuthHeaders(),
        }
      );
      // Có thể trả về 1 object hoặc null
      return data ?? null;
    } catch (error) {
      // Nếu lỗi 404 thì trả về null, các lỗi khác ném ra
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getById: async (id: string): Promise<IContactList> => {
    const { data } = await axios.get(`${BASE_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    return data;
  },

  create: async (createDto: CreateContactListDto): Promise<IContactList> => {
    const { data } = await axios.post(`${BASE_URL}`, createDto, {
      headers: getAuthHeaders(),
    });
    return data;
  },

  update: async (id: string, updateDto: UpdateContactListDto): Promise<IContactList> => {
    const { data } = await axios.patch(`${BASE_URL}/${id}`, updateDto, {
      headers: getAuthHeaders(),
    });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
  },
};
