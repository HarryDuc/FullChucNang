"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FaBoxOpen,
  FaMapMarkerAlt,
  FaRegCreditCard,
  FaRegUser,
} from "react-icons/fa";
import Head from "next/head";
import StatCard from "./StatCard";
import RecentOrderItem from "./RecentOrderItem";
import NotificationItem from "./NotificationItem";
import PageHeader from "./PageHeader";
import { useAccount } from "../hooks/useAccount";

// 🔔 Interface cho thông báo
interface Notification {
  id: string;
  type: "order" | "info" | "promo";
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}
// 📦 Interface cho đơn hàng gần đây

interface RecentOrder {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  itemCount: number;
}

// 🏠 Component trang Account
const Account = () => {
  const { user: authUser, logout, isAuthenticated } = useAuth();
  const { user, isLoading, error } = useAccount();

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      setRecentOrders([
        {
          id: "1",
          orderNumber: "ĐH-20240331-001",
          date: "31/03/2024",
          status: "Đang giao hàng",
          total: 750000,
          itemCount: 2,
        },
        {
          id: "2",
          orderNumber: "ĐH-20240329-005",
          date: "29/03/2024",
          status: "Đã giao hàng",
          total: 1250000,
          itemCount: 3,
        },
        {
          id: "3",
          orderNumber: "ĐH-20240315-010",
          date: "15/03/2024",
          status: "Đã hủy",
          total: 450000,
          itemCount: 1,
        },
      ]);
      setNotifications([
        {
          id: "1",
          type: "order",
          title: "Đơn hàng đã được giao",
          message: "Đơn hàng ĐH-20240329-005 đã được giao thành công!",
          date: "29/03/2024",
          isRead: false,
        },
        {
          id: "2",
          type: "promo",
          title: "Ưu đãi đặc biệt",
          message: "Giảm 20% cho tất cả sản phẩm trang trí nội thất!",
          date: "25/03/2024",
          isRead: false,
        },
        {
          id: "3",
          type: "info",
          title: "Cập nhật thông tin tài khoản",
          message: "Vui lòng cập nhật thông tin địa chỉ của bạn.",
          date: "20/03/2024",
          isRead: true,
        },
      ]);
      setIsLoadingData(false);
    }, 800);
  }, []);

  const handleLogout = () => {
    toast.success("Đăng xuất thành công!");
    logout();
    router.push("/login");
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
    toast.success("Đã đánh dấu thông báo là đã đọc");
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="flex justify-center items-center my-16">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative my-6"
          role="alert"
        >
          <strong className="font-bold">Lỗi! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div
          className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative my-6"
          role="alert"
        >
          <strong className="font-bold">Thông báo! </strong>
          <span className="block sm:inline">
            Vui lòng đăng nhập để xem thông tin tài khoản.
          </span>
          <div className="mt-3">
            <Link
              href="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Tổng quan tài khoản | {user?.fullName}</title>
        <meta
          name="description"
          content="Xem và quản lý các thông tin tài khoản, đơn hàng và thông báo của bạn."
        />
        <meta
          name="keywords"
          content="tài khoản, đơn hàng, thông báo, quản lý tài khoản"
        />
      </Head>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Tổng quan tài khoản"
          description="Quản lý thông tin và hoạt động tài khoản của bạn"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<FaBoxOpen className="text-blue-600" />}
            value="4"
            label="Tổng đơn hàng"
            color="bg-blue-100"
          />
          <StatCard
            icon={<FaMapMarkerAlt className="text-purple-600" />}
            value="2"
            label="Địa chỉ"
            color="bg-purple-100"
          />
          <StatCard
            icon={<FaRegUser className="text-emerald-600" />}
            value="3/5"
            label="Hoàn thiện hồ sơ"
            color="bg-emerald-100"
          />
          <StatCard
            icon={<FaRegCreditCard className="text-amber-600" />}
            value="0"
            label="Phương thức thanh toán"
            color="bg-amber-100"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center">
              <h3 className="font-medium">Đơn hàng gần đây</h3>
              <Link
                href="/account/orders"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Xem tất cả
              </Link>
            </div>
            <div className="p-4">
              {recentOrders.length > 0 ? (
                <div className="space-y-2">
                  {recentOrders.map((order) => (
                    <RecentOrderItem key={order.id} order={order} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
                    <FaBoxOpen />
                  </div>
                  <p className="text-gray-500 text-sm">
                    Bạn chưa có đơn hàng nào
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center">
              <h3 className="font-medium">Thông báo gần đây</h3>
              <button
                onClick={() => {
                  setNotifications((prev) =>
                    prev.map((notification) => ({
                      ...notification,
                      isRead: true,
                    }))
                  );
                  toast.success("Đã đánh dấu tất cả thông báo là đã đọc");
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Đánh dấu tất cả đã đọc
              </button>
            </div>
            <div className="p-4">
              {notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
                    <FaRegUser />
                  </div>
                  <p className="text-gray-500 text-sm">
                    Bạn không có thông báo nào
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Account;
