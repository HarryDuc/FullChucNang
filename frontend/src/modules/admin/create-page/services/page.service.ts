import axios from 'axios';

import { config } from "@/config/config";
import api from "@/config/api";
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
  async createPage(data: ICreatePageDto) {
    const response = await axios.post(`${API_URL}`, data, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  },

  async getAllPages() {
    const response = await axios.get(`${API_URL}`);
    return response.data;
  },

  async getPageById(id: string) {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  async getPageBySlug(slug: string) {
    const response = await axios.get(`${API_URL}/by-slug/${slug}`);
    return response.data;
  },

  async updatePage(slug: string, data: Partial<ICreatePageDto>) {
    const response = await axios.put(`${API_URL}/by-slug/${slug}`, data, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  },

  async deletePage(slug: string) {
    const response = await axios.delete(`${API_URL}/by-slug/${slug}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  },
};