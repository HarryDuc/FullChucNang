import api from '@/config/api';
import { Upimg, CreateUpimgRequest, UpdateUpimgRequest } from '../models';
import imageService from '@/common/services/imageService';

class UpimgService {
  async getAll(query?: Record<string, unknown>): Promise<Upimg[]> {
    console.log('Frontend: Getting all upimgs with query:', query);
    const response = await api.get('/upimgapi', { params: query });
    console.log('Frontend: getAll response:', response.data);
    return response.data;
  }

  async getById(id: string): Promise<Upimg> {
    const response = await api.get(`/upimgapi/${id}`);
    return response.data;
  }

  async getBySlug(slug: string): Promise<Upimg> {
    const response = await api.get(`/upimgapi/slug/${slug}`);
    return response.data;
  }

  async create(data: CreateUpimgRequest): Promise<Upimg> {
    console.log('Frontend: Creating upimg...');
    console.log('Frontend: Data:', data);
    const response = await api.post('/upimgapi', data);
    console.log('Frontend: Create response:', response.data);
    return response.data;
  }

  async createWithUpload(data: CreateUpimgRequest, files: File[]): Promise<Upimg> {
    console.log('Frontend: Creating upimg with upload...');
    console.log('Frontend: Data:', data);
    console.log('Frontend: Files:', files);

    try {
      // Nén ảnh trước khi upload
      console.log('Frontend: Compressing images before upload...');
      const compressedFiles = [];
      for (const file of files) {
        const compressedFile = await imageService.compressImage(file);
        compressedFiles.push(compressedFile);
        console.log(`Frontend: Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
      }

      const formData = new FormData();

      // Add the data fields
      Object.keys(data).forEach(key => {
        const value = (data as unknown as Record<string, unknown>)[key];
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Add the compressed files
      compressedFiles.forEach((file, index) => {
        console.log(`Frontend: Adding compressed file ${index}:`, file.name, file.size, file.type);
        formData.append('files', file);
      });

      console.log('Frontend: Sending request to /upimgapi/upload');
      const response = await api.post('/upimgapi/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Frontend: Response:', response.data);
      console.log('Frontend: Response images:', response.data.images);
      return response.data;
    } catch (error) {
      console.error('Frontend: Error in createWithUpload:', error);
      throw error;
    }
  }

  async update(id: string, data: UpdateUpimgRequest): Promise<Upimg> {
    const response = await api.put(`/upimgapi/${id}`, data);
    return response.data;
  }

  async updateWithUpload(id: string, data: UpdateUpimgRequest, files: File[]): Promise<Upimg> {
    try {
      // Nén ảnh trước khi upload
      console.log('Frontend: Compressing images before update upload...');
      const compressedFiles = [];
      for (const file of files) {
        const compressedFile = await imageService.compressImage(file);
        compressedFiles.push(compressedFile);
        console.log(`Frontend: Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
      }

      const formData = new FormData();

      // Add the data fields
      Object.keys(data).forEach(key => {
        const value = (data as unknown as Record<string, unknown>)[key];
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Add the compressed files
      compressedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await api.put(`/upimgapi/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Frontend: Error in updateWithUpload:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/upimgapi/${id}`);
  }

  async uploadImages(id: string, imageIds: string[]): Promise<Upimg> {
    const response = await api.post(`/upimgapi/${id}/images`, { imageIds });
    return response.data;
  }

  async removeImage(id: string, imageId: string): Promise<Upimg> {
    const response = await api.delete(`/upimgapi/${id}/images/${imageId}`);
    return response.data;
  }

  async updateOrder(id: string, order: number): Promise<Upimg> {
    const response = await api.put(`/upimgapi/${id}/order`, { order });
    return response.data;
  }

  async search(keyword: string): Promise<Upimg[]> {
    const response = await api.get(`/upimgapi/search/${keyword}`);
    return response.data;
  }

  async getByStatus(status: string): Promise<Upimg[]> {
    const response = await api.get(`/upimgapi/status/${status}`);
    return response.data;
  }
}

export default new UpimgService();