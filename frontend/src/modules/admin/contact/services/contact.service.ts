import axios from "axios";
import { config } from "@/config/config";
import { API_URL_CLIENT } from "@/config/apiRoutes";

const API_URL = API_URL_CLIENT + config.ROUTES.CONTACTS.BASE;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include token in headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;

      // Log full headers for debugging
      console.log('Request headers:', config.headers);
    } else {
      console.warn('No token found in localStorage');
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response:', response);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface IContact {
  _id: string;
  fullName: string;
  phoneNumber: string;
  customerEmail?: string;
  content: string;
  projectTitle: string;
  sendNotificationToAdmin: boolean;
  sendConfirmationToCustomer: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateContact {
  fullName: string;
  phoneNumber: string;
  customerEmail?: string;
  content: string;
  projectTitle: string;
  sendNotificationToAdmin: boolean;
  sendConfirmationToCustomer: boolean;
}

class ContactService {
  private readonly baseUrl = API_URL

  async getAllContacts(): Promise<IContact[]> {
    try {
      // Log current token before making request
      const token = localStorage.getItem('accessToken');
      console.log('Current token before request:', token);

      const response = await axiosInstance.get(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      // Log detailed error information
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
        console.error('Response headers:', error.response?.headers);
      }
      throw error;
    }
  }

  async getContactById(id: string): Promise<IContact> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }
  }

  async createContact(data: ICreateContact): Promise<IContact> {
    try {
      const response = await axiosInstance.post(this.baseUrl, data);
      return response.data;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  async deleteContact(id: string): Promise<IContact> {
    try {
      const response = await axiosInstance.delete(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }
}

export const contactService = new ContactService();