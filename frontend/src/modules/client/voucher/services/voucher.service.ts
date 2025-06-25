import axios, { AxiosError } from 'axios';
import { Voucher } from '../models/voucher.model';
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

export interface CheckVoucherValidityParams {
  code: string;
  productSlug?: string;
  userId?: string;
  paymentMethod?: string;
  totalAmount: number;
}

export interface CheckVoucherValidityResponse {
  valid: boolean;
  voucher?: Voucher;
  message?: string;
  discountAmount?: number;
  finalPrice?: number;
}

export interface ApplyVoucherParams {
  code: string;
  productSlug?: string;
}

export interface ApplyVoucherResponse {
  voucher: Voucher;
  discountAmount: number;
  finalPrice: number;
}

export class VoucherClientService {
  static async getValidVouchers(
    productSlug?: string,
    userId?: string,
    paymentMethod?: string,
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

  static async getVoucherByCode(code: string): Promise<Voucher> {
    const { data } = await axios.get<Voucher>(`${API_URL}/code/${code}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return data;
  }

  static async checkVoucherValidity({
    code,
    productSlug,
    userId,
    paymentMethod,
    totalAmount,
  }: CheckVoucherValidityParams): Promise<CheckVoucherValidityResponse> {
    const params = new URLSearchParams();
    if (productSlug) params.append('productSlug', productSlug);
    if (userId) params.append('userId', userId);
    if (paymentMethod) params.append('paymentMethod', paymentMethod);
    params.append('totalAmount', totalAmount.toString());

    try {
      const { data } = await axios.get<CheckVoucherValidityResponse>(
        `${API_URL}/check/${code}?${params}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      return data;
    } catch (error) {
      return {
        valid: false,
        message: (error as AxiosError<{ message: string }>)?.response?.data?.message || 'Voucher is not valid',
      };
    }
  }

  static async applyVoucher({
    code,
    productSlug,
  }: ApplyVoucherParams): Promise<ApplyVoucherResponse> {
    const params = new URLSearchParams();
    if (productSlug) params.append('productSlug', productSlug);

    const { data } = await axios.post<ApplyVoucherResponse>(
      `${API_URL}/use/${code}?${params}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return data;
  }

  static calculateDiscount(voucher: Voucher, totalAmount: number): {
    discountAmount: number;
    finalPrice: number;
  } {
    let discountAmount = 0;

    if (voucher.discountType === 'PERCENTAGE') {
      discountAmount = (totalAmount * voucher.discountValue) / 100;
    } else {
      discountAmount = voucher.discountValue;
    }

    // Ensure discount doesn't exceed the total amount
    discountAmount = Math.min(discountAmount, totalAmount);

    const finalPrice = totalAmount - discountAmount;

    return {
      discountAmount,
      finalPrice,
    };
  }
}