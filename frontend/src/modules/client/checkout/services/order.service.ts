import axios from "axios";
import {
  Checkout,
  getAllCheckouts,
  updatePaymentStatus as updateCheckoutPaymentStatus,
} from "./checkoutService";
import { Order } from "../models/order.models";

const BASE_API = process.env.NEXT_PUBLIC_API_URL!;
const ORDER_URL = `${BASE_API}/orders`;

// Interface cho đơn hàng với thông tin checkout
export interface OrderWithCheckout extends Order {
  checkout?: Checkout;
}

export const OrderService = {
  /**
   * Lấy danh sách tất cả đơn hàng kèm thông tin checkout
   */
  getOrders: async (): Promise<OrderWithCheckout[]> => {
    // Lấy danh sách đơn hàng
    const ordersResponse = await axios.get<Order[]>(ORDER_URL);
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
    const response = await axios.get<Order>(`${ORDER_URL}/${slug}`);
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
      return order;
    }
  },

  /**
   * Tạo mới một đơn hàng
   */
  createOrder: async (orderData: Partial<Order>): Promise<Order> => {
    const response = await axios.post<Order>(ORDER_URL, orderData);
    return response.data;
  },

  /**
   * Cập nhật đơn hàng theo slug
   */
  updateOrder: async (
    slug: string,
    orderData: Partial<Order>
  ): Promise<Order> => {
    const response = await axios.put<Order>(`${ORDER_URL}/${slug}`, orderData);
    return response.data;
  },

  /**
   * Xóa đơn hàng theo slug
   */
  deleteOrder: async (slug: string): Promise<{ message: string }> => {
    const response = await axios.delete<{ message: string }>(
      `${ORDER_URL}/${slug}`
    );
    return response.data;
  },

  /**
   * Cập nhật trạng thái thanh toán của checkout
   */
  updatePaymentStatus: async (
    checkoutSlug: string,
    paymentStatus: "pending" | "paid" | "failed"
  ): Promise<Checkout> => {
    return updateCheckoutPaymentStatus(checkoutSlug, paymentStatus);
  },

  /**
 * Tìm kiếm đơn hàng theo mã đơn hàng (slug) và kèm thông tin checkout nếu có
 */
  searchOrderBySlug: async (slug: string): Promise<OrderWithCheckout | null> => {
    try {
      const response = await axios.get<Order>(`${ORDER_URL}/${slug}`);
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
};
