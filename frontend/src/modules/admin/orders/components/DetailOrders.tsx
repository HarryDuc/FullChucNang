"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OrderService, OrderWithCheckout } from "../services/order.service";
import { OrderStatus } from "../models/order.models";

interface DetailOrdersProps {
  slug: string;
}

const DetailOrders = ({ slug }: DetailOrdersProps) => {
  const [order, setOrder] = useState<OrderWithCheckout | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [updatingPayment, setUpdatingPayment] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const data = await OrderService.getOrderBySlug(slug);
        setOrder(data);
      } catch (err) {
        setError("Không thể tải thông tin đơn hàng");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchOrderDetails();
    }
  }, [slug]);

  // Xử lý khi thay đổi trạng thái đơn hàng
  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order || !order.slug) return;

    try {
      setUpdatingStatus(true);
      const updatedOrder = await OrderService.updateOrder(order.slug, {
        status: newStatus,
      });
      setOrder({ ...order, ...updatedOrder });
    } catch (err) {
      setError("Không thể cập nhật trạng thái đơn hàng");
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Xử lý khi thay đổi trạng thái thanh toán
  const handlePaymentStatusChange = async (
    newStatus: "pending" | "paid" | "failed"
  ) => {
    if (!order || !order.checkout || !order.checkout.slug) return;

    try {
      setUpdatingPayment(true);
      setOrder({
        ...order,
        checkout: {
          ...order.checkout,
          paymentStatus: newStatus,
        },
      });
    } catch (err) {
      setError("Không thể cập nhật trạng thái thanh toán");
      console.error(err);
    } finally {
      setUpdatingPayment(false);
    }
  };

  // Hiển thị màu sắc dựa trên trạng thái đơn hàng
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Hiển thị màu sắc dựa trên trạng thái thanh toán
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Định dạng ngày giờ
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 text-xl">{error}</p>
        <button
          onClick={() => router.push("/admin/orders")}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Quay lại
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-center">
        <p className="text-xl">Không tìm thấy đơn hàng</p>
        <button
          onClick={() => router.push("/admin/orders")}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Chi tiết đơn hàng</h1>
        <button
          onClick={() => router.push("/admin/orders")}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Quay lại
        </button>
      </div>

      {/* Thông tin cơ bản đơn hàng */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Mã đơn hàng:</span> {order.slug}
              </p>
              <p>
                <span className="font-medium">Ngày tạo:</span>{" "}
                {formatDate(order.createdAt)}
              </p>
              <p>
                <span className="font-medium">Cập nhật lần cuối:</span>{" "}
                {formatDate(order.updatedAt)}
              </p>
              <div className="flex items-center mt-2">
                <span className="font-medium mr-2">Trạng thái đơn hàng:</span>
                {updatingStatus ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Đang cập nhật...</span>
                  </div>
                ) : (
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(e.target.value as OrderStatus)
                    }
                    className={`p-1 rounded border ${getStatusColor(
                      order.status
                    )} cursor-pointer`}
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Thông tin thanh toán */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Thông tin thanh toán</h2>
            {order.checkout ? (
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Phương thức thanh toán:</span>{" "}
                  {order.checkout.paymentMethod === "cash"
                    ? "Tiền mặt"
                    : order.checkout.paymentMethod === "bank"
                      ? "Chuyển khoản"
                      : order.checkout.paymentMethod}
                </p>
                <div className="flex items-center mt-2">
                  <span className="font-medium mr-2">
                    Trạng thái thanh toán:
                  </span>
                  {updatingPayment ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Đang cập nhật...</span>
                    </div>
                  ) : (
                    <select
                      value={order.checkout.paymentStatus}
                      onChange={(e) =>
                        handlePaymentStatusChange(
                          e.target.value as "pending" | "paid" | "failed"
                        )
                      }
                      className={`p-1 rounded border ${getPaymentStatusColor(
                        order.checkout.paymentStatus
                      )} cursor-pointer`}
                    >
                      <option value="pending">Chờ thanh toán</option>
                      <option value="paid">Đã thanh toán</option>
                      <option value="failed">Thanh toán thất bại</option>
                    </select>
                  )}
                </div>
                <p>
                  <span className="font-medium">Ngày thanh toán:</span>{" "}
                  {formatDate(order.checkout.createdAt)}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Chưa có thông tin thanh toán
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Thông tin khách hàng */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Thông tin khách hàng</h2>
        {order.checkout ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p>
                <span className="font-medium">Tên khách hàng:</span>{" "}
                {order.checkout.name}
              </p>
              <p>
                <span className="font-medium">Số điện thoại:</span>{" "}
                {order.checkout.phone}
              </p>
            </div>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Địa chỉ giao hàng:</span>{" "}
                {order.checkout.address}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">Chưa có thông tin khách hàng</p>
        )}
      </div>

      {/* Danh sách sản phẩm */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Danh sách sản phẩm</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">STT</th>
                <th className="border p-2">Tên sản phẩm</th>
                <th className="border p-2">Loại sản phẩm</th>
                <th className="border p-2 text-right">Đơn giá</th>
                <th className="border p-2 text-center">Số lượng</th>
                <th className="border p-2 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item, index) => {
                const productName =
                  typeof item.product === "string"
                    ? `Sản phẩm #${item.product.substring(0, 8)}`
                    : item.product?.name;

                return (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2">{productName}</td>
                    <td className="border p-2">
                      {item.variant ? item.variant : 'Mặc định'}
                    </td>
                    <td className="border p-2 text-right">
                      {item.price.toLocaleString()} VND
                    </td>
                    <td className="border p-2 text-center">{item.quantity}</td>
                    <td className="border p-2 text-right">
                      {(item.price * item.quantity).toLocaleString()} VND
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold">
                <td colSpan={5} className="border p-2 text-right">
                  Tổng cộng:
                </td>
                <td className="border p-2 text-right">
                  {order.totalPrice.toLocaleString()} VND
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Lịch sử đơn hàng - Phần này có thể bổ sung sau khi có API */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Lịch sử đơn hàng</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium">Đơn hàng được tạo</p>
              <p className="text-sm text-gray-500">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          {order.checkout && (
            <div className="flex items-start">
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium">Thông tin thanh toán được tạo</p>
                <p className="text-sm text-gray-500">
                  {formatDate(order.checkout.createdAt)}
                </p>
              </div>
            </div>
          )}

          {order.status === "processing" && (
            <div className="flex items-start">
              <div className="bg-yellow-100 rounded-full p-2 mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium">Đơn hàng đang được xử lý</p>
                <p className="text-sm text-gray-500">
                  {formatDate(order.updatedAt)}
                </p>
              </div>
            </div>
          )}

          {order.status === "completed" && (
            <div className="flex items-start">
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium">Đơn hàng đã hoàn thành</p>
                <p className="text-sm text-gray-500">
                  {formatDate(order.updatedAt)}
                </p>
              </div>
            </div>
          )}

          {order.status === "cancelled" && (
            <div className="flex items-start">
              <div className="bg-red-100 rounded-full p-2 mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium">Đơn hàng đã bị hủy</p>
                <p className="text-sm text-gray-500">
                  {formatDate(order.updatedAt)}
                </p>
              </div>
            </div>
          )}

          {order.checkout && order.checkout.paymentStatus === "paid" && (
            <div className="flex items-start">
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium">Thanh toán thành công</p>
                <p className="text-sm text-gray-500">
                  {formatDate(order.checkout.updatedAt)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailOrders;
