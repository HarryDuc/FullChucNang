import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface IPage {
  _id?: string;
  name: string;
  slug: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreatePageDto {
  name: string;
  slug: string;
  content: string;
}

export const PageService = {
  async createPage(data: ICreatePageDto) {
    const response = await axios.post(`${API_URL}/pages`, data);
    return response.data;
  },

  async getAllPages() {
    const response = await axios.get(`${API_URL}/pages`);
    return response.data;
  },

  async getPageById(id: string) {
    const response = await axios.get(`${API_URL}/pages/${id}`);
    return response.data;
  },

  async getPageBySlug(slug: string) {
    const response = await axios.get(`${API_URL}/pages/by-slug/${slug}`);
    return response.data;
  },

  async updatePage(slug: string, data: Partial<ICreatePageDto>) {
    const response = await axios.put(`${API_URL}/pages/by-slug/${slug}`, data);
    return response.data;
  },

  async deletePage(slug: string) {
    const response = await axios.delete(`${API_URL}/pages/by-slug/${slug}`);
    return response.data;
  },
};