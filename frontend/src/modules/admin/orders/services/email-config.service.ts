import api from '@/config/api';
import { API_ROUTES } from '@/config/apiRoutes';

export interface EmailConfig {
  _id?: string;
  sendUserOrderConfirmation: boolean;
  sendUserPaymentSuccess: boolean;
  sendAdminOrderNotification: boolean;
  sendAdminPaymentSuccess: boolean;
  adminEmails: string[];
  adminDashboardUrl: string;
  adminOrdersUrl: string;
  defaultAdminEmail: string;
  emailEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailTestRequest {
  orderId: string;
  checkoutId: string;
  type: 'confirmation' | 'payment-success';
  sendToUser?: boolean;
  sendToAdmin?: boolean;
}

export interface EmailSendRequest {
  orderId: string;
  checkoutId: string;
  sendToUser?: boolean;
  sendToAdmin?: boolean;
}

export class EmailConfigService {
  private static baseUrl = '/ordersapi/admin/email-config';

  /**
   * Lấy cấu hình email hiện tại
   */
  static async getEmailConfiguration(): Promise<EmailConfig> {
    try {
      const response = await api.get(`${this.baseUrl}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching email configuration:', error);
      throw error;
    }
  }

  /**
   * Cập nhật cấu hình email
   */
  static async updateEmailConfiguration(config: Partial<EmailConfig>): Promise<EmailConfig> {
    try {
      const response = await api.put(`${this.baseUrl}`, config, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating email configuration:', error);
      throw error;
    }
  }

  /**
   * Bật/tắt toàn bộ hệ thống email
   */
  static async toggleEmailSystem(enabled: boolean): Promise<EmailConfig> {
    try {
      const response = await api.post(`${this.baseUrl}/toggle-system`, { enabled }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling email system:', error);
      throw error;
    }
  }

  /**
   * Bật/tắt email cho user
   */
  static async toggleUserEmails(orderConfirmation: boolean, paymentSuccess: boolean): Promise<EmailConfig> {
    try {
      const response = await api.post(`${this.baseUrl}/toggle-user`, { orderConfirmation, paymentSuccess }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling user emails:', error);
      throw error;
    }
  }

  /**
   * Bật/tắt email cho admin
   */
  static async toggleAdminEmails(orderNotification: boolean, paymentSuccess: boolean): Promise<EmailConfig> {
    try {
      const response = await api.post(`${this.baseUrl}/toggle-admin`, { orderNotification, paymentSuccess }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling admin emails:', error);
      throw error;
    }
  }

  /**
   * Thêm email admin
   */
  static async addAdminEmail(email: string): Promise<EmailConfig> {
    try {
      const response = await api.post(`${this.baseUrl}/admin-emails`, { email }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding admin email:', error);
      throw error;
    }
  }

  /**
   * Xóa email admin
   */
  static async removeAdminEmail(email: string): Promise<EmailConfig> {
    try {
      const response = await api.post(`${this.baseUrl}/admin-emails/remove`, { email }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing admin email:', error);
      throw error;
    }
  }

  /**
   * Test gửi email
   */
  static async testEmail(request: EmailTestRequest): Promise<{ message: string }> {
    try {
      const response = await api.post(`${this.baseUrl}/test`, request, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error testing email:', error);
      throw error;
    }
  }

  /**
   * Gửi email xác nhận đơn hàng
   */
  static async sendOrderConfirmationEmail(request: EmailSendRequest): Promise<{ message: string }> {
    try {
      const response = await api.post('/ordersapi/email/send-confirmation', request, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      throw error;
    }
  }

  /**
   * Gửi email thanh toán thành công
   */
  static async sendPaymentSuccessEmail(request: EmailSendRequest): Promise<{ message: string }> {
    try {
      const response = await api.post('/ordersapi/email/send-payment-success', request, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending payment success email:', error);
      throw error;
    }
  }
}