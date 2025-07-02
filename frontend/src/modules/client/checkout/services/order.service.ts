import axios from "axios";
import {
  Checkout,
  getAllCheckouts,
} from "./checkoutService";
import { Order } from "../models/order.models";
import { config } from "@/config/config";
import { API_URL_CLIENT } from "@/config/apiRoutes";

const ORDER_URL = API_URL_CLIENT + config.ROUTES.ORDERS.BASE;

// Interface cho đơn hàng với thông tin checkout
export interface OrderWithCheckout extends Order {
  checkout?: Checkout;
}

// Interface cho cập nhật trạng thái thanh toán
export interface PaymentStatusUpdate {
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed";
  paymentInfo?: Record<string, any>;
}

// Helper function để lấy token xác thực
const getAuthHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

interface CreateOrderData {
  orderItems: {
    product: string;
    quantity: number;
    price: number;
    variant?: string;
  }[];
  voucherId?: string;
  subtotalPrice?: number;
  voucherCode?: string;
  discountAmount?: number;
  totalPrice?: number;
  status?: string;
}

export const OrderService = {
  /**
   * Lấy danh sách tất cả đơn hàng kèm thông tin checkout
   */
  getOrders: async (): Promise<OrderWithCheckout[]> => {
    // Lấy danh sách đơn hàng
    const ordersResponse = await axios.get<Order[]>(ORDER_URL, {
      headers: getAuthHeader(),
    });
    const orders = ordersResponse.data;

    // Lấy danh sách checkout từ checkout service
    try {
      const checkouts = await getAllCheckouts();

      // Kết hợp thông tin đơn hàng và checkout
      const ordersWithCheckout = orders.map((order) => {
        // Đảm bảo order._id tồn tại trước khi tìm kiếm checkout
        if (!order._id) {
          console.warn("Đơn hàng không có _id:", order);
          return {
            ...order,
            checkout: undefined,
          };
        }

        const orderCheckout = checkouts.find(
          (checkout: any) => checkout.orderId === order._id
        );

        return {
          ...order,
          checkout: orderCheckout,
        };
      });

      return ordersWithCheckout;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin checkout:", error);
      // Nếu không lấy được checkout, vẫn trả về đơn hàng
      return orders.map((order) => ({ ...order }));
    }
  },

  /**
   * Lấy thông tin chi tiết đơn hàng theo slug kèm thông tin checkout
   */
  getOrderBySlug: async (slug: string): Promise<OrderWithCheckout> => {
    const response = await axios.get<Order>(`${ORDER_URL}/${slug}`, {
      headers: getAuthHeader(),
    });
    const order = response.data;

    try {
      // Lấy danh sách checkout từ checkout service
      const checkouts = await getAllCheckouts();
      const orderCheckout = checkouts.find(
        (checkout: any) => checkout.orderId === order._id
      );

      return {
        ...order,
        checkout: orderCheckout,
      };
    } catch (error) {
      // Nếu không tìm thấy checkout, vẫn trả về đơn hàng
      console.log(error);
      return order;
    }
  },

  /**
   * Tạo mới một đơn hàng
   */
  createOrder: async (orderData: CreateOrderData): Promise<Order> => {
    try {
      const response = await fetch(`${ORDER_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  /**
   * Cập nhật đơn hàng theo slug
   */
  updateOrder: async (
    slug: string,
    orderData: Partial<Order>
  ): Promise<Order> => {
    const response = await axios.put<Order>(`${ORDER_URL}/${slug}`, orderData, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  /**
   * Xóa đơn hàng theo slug
   */
  deleteOrder: async (slug: string): Promise<{ message: string }> => {
    const response = await axios.delete<{ message: string }>(
      `${ORDER_URL}/${slug}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  /**
   * Cập nhật trạng thái thanh toán của checkout
   */
  updatePaymentStatus: async (
    orderSlug: string,
    paymentUpdate: PaymentStatusUpdate
  ): Promise<any> => {
    try {
      const response = await axios.post(
        `${ORDER_URL}/${orderSlug}/update-payment-status`,
        paymentUpdate,
        {
          headers: getAuthHeader(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái thanh toán:", error);
      throw new Error("Không thể cập nhật trạng thái thanh toán");
    }
  },

  /**
 * Tìm kiếm đơn hàng theo mã đơn hàng (slug) và kèm thông tin checkout nếu có
 */
  searchOrderBySlug: async (slug: string): Promise<OrderWithCheckout | null> => {
    try {
      const response = await axios.get<Order>(`${ORDER_URL}/${slug}`, {
        headers: getAuthHeader(),
      });
      const order = response.data;

      const checkouts = await getAllCheckouts();
      const orderCheckout = checkouts.find(
        (checkout: any) => checkout.orderId === order._id
      );

      return {
        ...order,
        checkout: orderCheckout,
      };
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null; // Không tìm thấy
      }
      console.error("Lỗi khi tìm kiếm đơn hàng:", error);
      throw new Error("Đã xảy ra lỗi khi tìm kiếm đơn hàng.");
    }
  },

  async getOrder(slug: string) {
    try {
      const response = await fetch(`${ORDER_URL}/${slug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  },
};
