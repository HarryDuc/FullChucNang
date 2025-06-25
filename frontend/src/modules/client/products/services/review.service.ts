import { AxiosResponse } from 'axios';
import api from '@/config/api';
import { IReview } from '../models/review.model';
import { config } from "@/config/config";
import { API_URL_CLIENT } from "@/config/apiRoutes";
const API_URL = API_URL_CLIENT + config.ROUTES.REVIEWS.BASE;

export interface ICreateReviewDto {
  productSlug: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  attributes?: string[];
}

export interface IProductRating {
  averageRating: number;
  totalReviews: number;
}

export const reviewService = {
  // Tạo review mới
  createReview: (data: ICreateReviewDto): Promise<AxiosResponse<IReview>> => {
    const reviewData = {
      ...data,
      userName: data.userName || "Người dùng",
      userEmail: data.userEmail || "",
      userAvatar: data.userAvatar || null,
    };
    console.log('Review data being sent to API:', reviewData);
    return api.post(`${API_URL}`, reviewData);
  },

  // Lấy tất cả reviews của một sản phẩm
  getProductReviews: (productSlug: string): Promise<AxiosResponse<IReview[]>> => {
    return api.get(`${API_URL}/product/${productSlug}`);
  },

  // Lấy rating tổng hợp của sản phẩm
  getProductRating: (productSlug: string): Promise<AxiosResponse<IProductRating>> => {
    return api.get(`${API_URL}/product/${productSlug}/rating`);
  },

  // Lấy một review cụ thể
  getReview: (id: string): Promise<AxiosResponse<IReview>> => {
    return api.get(`${API_URL}/${id}`);
  },

  // Cập nhật review
  updateReview: (id: string, data: Partial<ICreateReviewDto>): Promise<AxiosResponse<IReview>> => {
    return api.put(`${API_URL}/${id}`, data);
  },

  // Xóa review
  deleteReview: (id: string): Promise<AxiosResponse<void>> => {
    return api.delete(`${API_URL}/${id}`);
  },
};