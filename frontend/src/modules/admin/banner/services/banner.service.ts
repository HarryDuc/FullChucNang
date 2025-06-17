import axiosInstance from '@/common/utils/axios';
import { Banner } from '@/modules/client/home/models/banner.model';

const API_URL = '/banners';

export interface CreateBannerDto {
  imagePath: string;
  type: 'main' | 'sub' | 'mobile';
  isActive?: boolean;
  order: number;
  link?: string;
  title?: string;
  description?: string;
}

export interface UpdateBannerDto extends Partial<CreateBannerDto> { }

export const AdminBannerService = {
  /**
   * Lấy danh sách banner
   */
  async getBanners(type?: string, isActive?: boolean): Promise<Banner[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (isActive !== undefined) params.append('isActive', String(isActive));

    const response = await axiosInstance.get(`${API_URL}?${params.toString()}`);
    return response.data;
  },

  /**
   * Lấy chi tiết banner
   */
  async getBannerById(id: string): Promise<Banner> {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  /**
   * Tạo banner mới
   */
  async createBanner(data: CreateBannerDto): Promise<Banner> {
    const response = await axiosInstance.post(API_URL, data);
    return response.data;
  },

  /**
   * Cập nhật banner
   */
  async updateBanner(id: string, data: UpdateBannerDto): Promise<Banner> {
    const response = await axiosInstance.patch(`${API_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Cập nhật thứ tự banner
   */
  async updateBannerOrder(id: string, order: number): Promise<Banner> {
    const response = await axiosInstance.patch(`${API_URL}/${id}/order`, { order });
    return response.data;
  },

  /**
   * Bật/tắt trạng thái banner
   */
  async toggleBannerActive(id: string): Promise<Banner> {
    const response = await axiosInstance.patch(`${API_URL}/${id}/toggle-active`, {});
    return response.data;
  },

  /**
   * Xóa banner
   */
  async deleteBanner(id: string): Promise<void> {
    await axiosInstance.delete(`${API_URL}/${id}`);
  }
};