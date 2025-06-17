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
  async getPageBySlug(slug: string): Promise<IPage> {
    try {
      const response = await axios.get(`${API_URL}/pages/by-slug/${slug}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};