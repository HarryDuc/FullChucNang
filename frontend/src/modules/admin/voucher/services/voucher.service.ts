import axios from 'axios';
import {
  Voucher,
  CreateVoucherDto,
  UpdateVoucherDto,
  VoucherResponse
} from '../models/voucher.model';

import { config } from "@/config/config";
import { API_URL_CLIENT } from "@/config/apiRoutes";

const API_URL = API_URL_CLIENT + config.ROUTES.VOUCHERS.BASE;

// Safe way to access localStorage in Next.js (works in both client and server)
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || '';
  }
  return '';
};

export class VoucherService {
  // Get all vouchers with pagination
  static async getVouchers(page: number = 1, limit: number = 10): Promise<VoucherResponse> {
    const { data } = await axios.get<VoucherResponse>(API_URL, {
      params: { page, limit },
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return data;
  }

  // Get valid vouchers for specific criteria
  static async getValidVouchers(
    productSlug?: string,
    userId?: string,
    paymentMethod?: string
  ): Promise<Voucher[]> {
    const params = new URLSearchParams();
    if (productSlug) params.append('productSlug', productSlug);
    if (userId) params.append('userId', userId);
    if (paymentMethod) params.append('paymentMethod', paymentMethod);

    const { data } = await axios.get<Voucher[]>(`${API_URL}/valid?${params}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return data;
  }

  // Get voucher by ID
  static async getVoucherById(id: string): Promise<Voucher> {
    const { data } = await axios.get<Voucher>(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return data;
  }

  // Get voucher by code
  static async getVoucherByCode(code: string): Promise<Voucher> {
    const { data } = await axios.get<Voucher>(`${API_URL}/code/${code}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return data;
  }

  // Create new voucher
  static async createVoucher(voucherData: CreateVoucherDto): Promise<Voucher> {
    const { data } = await axios.post<Voucher>(API_URL, voucherData, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return data;
  }

  // Update voucher
  static async updateVoucher(id: string, voucherData: UpdateVoucherDto): Promise<Voucher> {
    const { data } = await axios.patch<Voucher>(`${API_URL}/${id}`, voucherData, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return data;
  }

  // Delete voucher
  static async deleteVoucher(id: string): Promise<void> {
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  }

  // Use voucher
  async useVoucher(code: string, productSlug?: string): Promise<Voucher> {
    const params = new URLSearchParams();
    if (productSlug) params.append('productSlug', productSlug);

    const response = await axios.post<Voucher>(
      `${API_URL}/use/${code}?${params}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return response.data;
  }
}