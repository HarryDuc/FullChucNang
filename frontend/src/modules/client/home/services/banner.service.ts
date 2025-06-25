import axios from 'axios';
import { Banner } from '../models/banner.model';

import { config } from "@/config/config";
import { API_URL_CLIENT } from "@/config/apiRoutes";
const API_URL = API_URL_CLIENT + config.ROUTES.BANNERS.BASE;

export const BannerService = {
  /**
   * Lấy danh sách banner theo type và trạng thái
   */
  async getBanners(type?: string, isActive?: boolean): Promise<Banner[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (isActive !== undefined) params.append('isActive', String(isActive));

    const response = await axios.get(`${API_URL}?${params.toString()}`);
    return response.data;
  },

  /**
   * Lấy danh sách banner đang active theo type
   */
  async getActiveBannersByType(type: string): Promise<Banner[]> {
    const response = await axios.get(`${API_URL}/active/${type}`);
    return response.data;
  },

  /**
   * Lấy chi tiết một banner
   */
  async getBannerById(id: string): Promise<Banner> {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  }
};