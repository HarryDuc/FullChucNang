import api from "@/config/api";
import { config } from "@/config/config";
import { API_URL_CLIENT } from "@/config/apiRoutes";
const API_URL = API_URL_CLIENT + config.ROUTES.PAYPAL.BASE;
const ORDER_URL = API_URL_CLIENT + config.ROUTES.ORDERS.BASE;
const CHECKOUT_URL = API_URL_CLIENT + config.ROUTES.CHECKOUTS.BASE;

// Exchange rate from VND to USD - this should be updated regularly or fetched from an API
// Default is approximately 23,000 VND to 1 USD
const DEFAULT_EXCHANGE_RATE = 23000;

export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: { href: string; rel: string; method: string }[];
}

export const paypalService = {
  /**
   * Convert VND to USD with a fixed exchange rate
   * @param amountVND Amount in VND
   * @returns Converted amount in USD (rounded to 2 decimal places)
   */
  convertVNDtoUSD: (amountVND: number): number => {
    return Math.round((amountVND / DEFAULT_EXCHANGE_RATE) * 100) / 100;
  },

  /**
   * Create a PayPal order
   * @param amount Amount in VND
   * @param orderRef Reference to the local order
   * @returns PayPal order details
   */
  createPayPalOrder: async (amount: number, orderRef: string): Promise<PayPalOrderResponse> => {
    try {
      const amountUSD = paypalService.convertVNDtoUSD(amount);

      // Thêm token vào header nếu người dùng đã đăng nhập
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Get voucher information if available
      const voucherId = localStorage.getItem('appliedVoucherId');
      const voucherCode = localStorage.getItem('appliedVoucherCode');
      const voucherDiscount = localStorage.getItem('appliedVoucherDiscount');

      // Create payment description with voucher info if available
      let description = "Đơn hàng từ Decor & More";
      if (voucherCode && voucherDiscount) {
        const discountAmount = parseFloat(voucherDiscount);
        description += ` - Mã giảm giá: ${voucherCode} (Giảm ${discountAmount.toLocaleString()} VND)`;
      }

      const response = await api.post(`${API_URL}/create-order`, {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amountUSD.toString(),
            },
            custom_id: orderRef, // Use custom_id to store our order reference
            description: description,
          },
        ],
        application_context: {
          brand_name: "Decor & More",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          return_url: `${window.location.origin}/checkout/success`,
          cancel_url: `${window.location.origin}/checkout/cancel`,
        },
        // Include voucher information in metadata if available
        metadata: voucherId ? {
          voucherId,
          voucherCode,
          voucherDiscount
        } : undefined
      }, { headers });

      return response.data;
    } catch (error) {
      console.error("Error creating PayPal order:", error);
      throw error;
    }
  },

  /**
   * Capture a PayPal payment
   * @param orderId PayPal order ID
   * @returns Capture details
   */
  capturePayment: async (orderId: string): Promise<any> => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await api.post(`${API_URL}/order/${orderId}/capture`, {}, { headers });
      return response.data;
    } catch (error) {
      console.error("Error capturing PayPal payment:", error);
      throw error;
    }
  },

  /**
   * Update order and checkout status after successful PayPal payment
   * @param orderSlug Local order slug
   * @param paypalOrderId PayPal order ID
   * @returns Updated order details
   */
  updateOrderStatus: async (orderSlug: string, paypalOrderId: string): Promise<any> => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Get voucher information if available
      const voucherId = localStorage.getItem('appliedVoucherId');
      const voucherCode = localStorage.getItem('appliedVoucherCode');
      const voucherDiscount = localStorage.getItem('appliedVoucherDiscount');

      // Payment info with voucher details
      const paymentInfo: any = {
        paypalOrderId,
      };

      // Add voucher information if available
      if (voucherId && voucherCode && voucherDiscount) {
        paymentInfo.voucher = {
          id: voucherId,
          code: voucherCode,
          discount: parseFloat(voucherDiscount)
        };
      }

      // Update order status
      const orderResponse = await api.post(`${ORDER_URL}/${orderSlug}/update-payment-status`, {
        paymentMethod: "paypal",
        paymentStatus: "paid",
        paymentInfo,
      }, { headers });

      // Update checkout status
      const checkoutResponse = await api.put(`${CHECKOUT_URL}/${orderSlug}-payment/payment-status`, {
        paymentStatus: "paid"
      }, { headers });

      return {
        order: orderResponse.data,
        checkout: checkoutResponse.data
      };
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw error;
    }
  },
};
