import axios from 'axios';
import { config } from "@/config/config";
import { API_URL_CLIENT } from "@/config/apiRoutes";

const API_URL = API_URL_CLIENT + config.ROUTES.CREATE_PAGES.BASE;

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
      const response = await axios.get(`${API_URL}/by-slug/${slug}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};