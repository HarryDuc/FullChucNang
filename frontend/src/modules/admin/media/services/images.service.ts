import axios from 'axios';

import { config } from "@/config/config";
import { API_URL_CLIENT } from "@/config/apiRoutes";

const API_URL = API_URL_CLIENT + config.ROUTES.IMAGES.BASE;

export interface ImageResponse {
  _id: string;
  originalName: string;
  imageUrl: string;
  location: string;
  slug: string;
  alt: string;
  caption?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const imagesService = {
  // Lấy tất cả ảnh
  getAllImages: async (): Promise<ImageResponse[]> => {
    try {
      console.log('Calling API:', `${API_URL}`);
      const response = await axios.get(`${API_URL}`);
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Upload một ảnh
  uploadImage: async (file: File): Promise<ImageResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload nhiều ảnh
  uploadMultipleImages: async (files: File[]): Promise<ImageResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await axios.post(`${API_URL}/upload-multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Xóa ảnh theo slug
  deleteImage: async (slug: string): Promise<void> => {
    await axios.delete(`${API_URL}/${slug}`);
  },

  // Upload ảnh cho SunEditor
  uploadEditorImage: async (file: File): Promise<ImageResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/sunEditor`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};