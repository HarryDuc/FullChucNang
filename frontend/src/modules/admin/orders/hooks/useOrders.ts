import { useState, useEffect } from "react";
import { Order, OrderStatus } from "../models/order.models";
import { OrderService, OrderWithCheckout } from "../services/order.service";
import { Checkout } from "../../checkouts/services/checkoutService";

export const useOrders = () => {
  const [orders, setOrders] = useState<OrderWithCheckout[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch danh sách đơn hàng
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching orders list...");
      const data = await OrderService.getOrders();
      console.log("Successfully fetched orders:", data.length);

      // Log checkout information
      const ordersWithCheckout = data.filter(order => order.checkout);
      const ordersWithoutCheckout = data.filter(order => !order.checkout);

      console.log(`Orders with checkout: ${ordersWithCheckout.length}`);
      console.log(`Orders without checkout: ${ordersWithoutCheckout.length}`);

      if (ordersWithoutCheckout.length > 0) {
        console.log("Orders missing checkout info:",
          ordersWithoutCheckout.map(order => ({
            id: order._id,
            slug: order.slug,
            createdAt: order.createdAt
          }))
        );
      }

      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // Tạo đơn hàng mới
  const createOrder = async (newOrder: Partial<Order>) => {
    try {
      const createdOrder = await OrderService.createOrder(newOrder);
      setOrders((prevOrders) => [...prevOrders, createdOrder]);
    } catch (err) {
      console.log(err);
      setError("Không thể tạo đơn hàng");
    }
  };

  // Cập nhật đơn hàng
  const updateOrder = async (slug: string, updatedOrder: Partial<Order>) => {
    try {
      const updated = await OrderService.updateOrder(slug, updatedOrder);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.slug === slug ? { ...order, ...updated } : order
        )
      );
      return updated;
    } catch (err) {
      console.log(err);
      setError("Không thể cập nhật đơn hàng");
      throw err;
    }
  };

  // Cập nhật trạng thái đơn hàng
  const updateOrderStatus = async (slug: string, status: OrderStatus) => {
    try {
      const updated = await updateOrder(slug, { status });
      return updated;
    } catch (err) {
      console.log(err);
      setError("Không thể cập nhật trạng thái đơn hàng");
      throw err;
    }
  };

  // Cập nhật trạng thái thanh toán
  const updatePaymentStatus = async (
    checkoutSlug: string,
    paymentStatus: "pending" | "paid" | "failed"
  ) => {
    try {
      const updatedCheckout = await OrderService.updatePaymentStatus(
        checkoutSlug,
        paymentStatus
      );

      // Cập nhật trạng thái thanh toán trong state
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.checkout?.slug === checkoutSlug) {
            return {
              ...order,
              checkout: {
                ...order.checkout,
                paymentStatus,
              } as Checkout,
            };
          }
          return order;
        })
      );

      return updatedCheckout;
    } catch (err) {
      console.log(err);
      setError("Không thể cập nhật trạng thái thanh toán");
      throw err;
    }
  };

  // Xóa đơn hàng
  const deleteOrder = async (slug: string) => {
    try {
      await OrderService.deleteOrder(slug);
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.slug !== slug)
      );
    } catch (err) {
      setError("Không thể xóa đơn hàng");
    }
  };

  // 🔍 Tìm kiếm đơn hàng theo mã (slug)
  const searchOrder = async (
    slug: string
  ): Promise<OrderWithCheckout | null> => {
    setLoading(true);
    setError(null);
    try {
      const order = await OrderService.searchOrderBySlug(slug);
      return order;
    } catch (err) {
      setError("Không thể tìm kiếm đơn hàng");
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrder,
    updateOrderStatus,
    updatePaymentStatus,
    deleteOrder,
    searchOrder,
  };
};
