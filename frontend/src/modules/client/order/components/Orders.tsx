"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  IoChevronDown,
  IoChevronUp,
  IoSearch,
  IoFilter,
  IoClose,
} from "react-icons/io5";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import {
  FaCalendarAlt,
  FaFileInvoice,
  FaUndo,
  FaTimes,
} from "react-icons/fa";
import { MdAccessTime, MdError } from "react-icons/md";
import toast from "react-hot-toast";
import PageHeader from "../../account/components/PageHeader";

// 📦 Interface cho đơn hàng
interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  items: number;
  products: OrderProduct[];
}

// 📦 Interface cho sản phẩm trong đơn hàng
interface OrderProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  image: string;
  slug: string;
}

// 🔍 Trạng thái đơn hàng
type OrderStatus = "Tất cả" | "Đang giao hàng" | "Đã giao hàng" | "Đã hủy";

const OrderSection = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>(
    {}
  );

  // 🔍 State cho tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("Tất cả");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 🔄 Giả lập lấy dữ liệu đơn hàng
  useEffect(() => {
    // Giả lập API call
    setTimeout(() => {
      // Dữ liệu mẫu
      const dummyOrders: Order[] = [
        {
          id: "1",
          orderNumber: "ĐH-20240331-001",
          date: "31/03/2024",
          status: "Đang giao hàng",
          total: 750000,
          items: 2,
          products: [
            {
              id: "p1",
              name: "Đồng hồ treo tường Vintage",
              price: 350000,
              quantity: 1,
              variant: "Màu gỗ tự nhiên",
              image: "/images/product-placeholder.jpg",
              slug: "dong-ho-treo-tuong-vintage",
            },
            {
              id: "p2",
              name: "Gối sofa trang trí",
              price: 400000,
              quantity: 1,
              variant: "Màu vàng nhạt",
              image: "/images/product-placeholder.jpg",
              slug: "goi-sofa-trang-tri",
            },
          ],
        },
        {
          id: "2",
          orderNumber: "ĐH-20240329-005",
          date: "29/03/2024",
          status: "Đã giao hàng",
          total: 1250000,
          items: 3,
          products: [
            {
              id: "p3",
              name: "Tranh canvas phong cảnh",
              price: 550000,
              quantity: 1,
              variant: "50x70cm",
              image: "/images/product-placeholder.jpg",
              slug: "tranh-canvas-phong-canh",
            },
            {
              id: "p4",
              name: "Bình hoa trang trí",
              price: 250000,
              quantity: 1,
              variant: "Màu trắng",
              image: "/images/product-placeholder.jpg",
              slug: "binh-hoa-trang-tri",
            },
            {
              id: "p5",
              name: "Đèn bàn trang trí",
              price: 450000,
              quantity: 1,
              variant: "Màu đồng",
              image: "/images/product-placeholder.jpg",
              slug: "den-ban-trang-tri",
            },
          ],
        },
        {
          id: "3",
          orderNumber: "ĐH-20240315-010",
          date: "15/03/2024",
          status: "Đã hủy",
          total: 450000,
          items: 1,
          products: [
            {
              id: "p6",
              name: "Mô hình xe vintage",
              price: 450000,
              quantity: 1,
              variant: "Màu đỏ",
              image: "/images/product-placeholder.jpg",
              slug: "mo-hinh-xe-vintage",
            },
          ],
        },
        {
          id: "4",
          orderNumber: "ĐH-20240228-015",
          date: "28/02/2024",
          status: "Đã giao hàng",
          total: 850000,
          items: 2,
          products: [
            {
              id: "p7",
              name: "Giá sách trang trí",
              price: 450000,
              quantity: 1,
              variant: "Gỗ sồi",
              image: "/images/product-placeholder.jpg",
              slug: "gia-sach-trang-tri",
            },
            {
              id: "p8",
              name: "Tượng trang trí mini",
              price: 400000,
              quantity: 1,
              variant: "Màu đồng",
              image: "/images/product-placeholder.jpg",
              slug: "tuong-trang-tri-mini",
            },
          ],
        },
      ];

      setOrders(dummyOrders);
      setFilteredOrders(dummyOrders);
      setIsLoading(false);
    }, 1000);
  }, []);

  // 🔄 Lọc đơn hàng khi các điều kiện lọc thay đổi
  useEffect(() => {
    let results = [...orders];

    // Lọc theo trạng thái
    if (selectedStatus !== "Tất cả") {
      results = results.filter((order) => order.status === selectedStatus);
    }

    // Lọc theo từ khóa tìm kiếm (mã đơn hàng hoặc tên sản phẩm)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      results = results.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(search) ||
          order.products.some((product) =>
            product.name.toLowerCase().includes(search)
          )
      );
    }

    // Lọc theo ngày từ
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      results = results.filter((order) => {
        const orderDate = parseVietnameseDate(order.date);
        return orderDate >= fromDate;
      });
    }

    // Lọc theo ngày đến
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      results = results.filter((order) => {
        const orderDate = parseVietnameseDate(order.date);
        return orderDate <= toDate;
      });
    }

    setFilteredOrders(results);
  }, [orders, searchTerm, selectedStatus, dateRange]);

  // 🔼 Xử lý đóng/mở dropdown chi tiết đơn hàng
  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // 🔄 Reset bộ lọc
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("Tất cả");
    setDateRange({ from: "", to: "" });
  };

  // 💲 Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "đ");
  };

  // 📅 Chuyển đổi ngày Việt Nam (dd/mm/yyyy) thành đối tượng Date
  const parseVietnameseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  // 🎨 Trạng thái màu sắc
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã giao hàng":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          dot: "bg-emerald-500",
        };
      case "Đang giao hàng":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          dot: "bg-blue-500",
        };
      case "Đã hủy":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          dot: "bg-red-500",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          dot: "bg-gray-500",
        };
    }
  };

  // 🛠️ Hàm xử lý hiển thị trạng thái
  const renderStatus = (status: string) => {
    switch (status) {
      case "Đã giao hàng":
        return (
          <div className="flex items-center text-emerald-700">
            <IoMdCheckmarkCircleOutline className="mr-1.5" />
            <span>Đã giao hàng</span>
          </div>
        );
      case "Đang giao hàng":
        return (
          <div className="flex items-center text-blue-700">
            <MdAccessTime className="mr-1.5" />
            <span>Đang giao hàng</span>
          </div>
        );
      case "Đã hủy":
        return (
          <div className="flex items-center text-red-700">
            <MdError className="mr-1.5" />
            <span>Đã hủy</span>
          </div>
        );
      default:
        return <span>{status}</span>;
    }
  };

  // 🛠️ Hàm xử lý hủy đơn hàng
  const handleCancelOrder = (orderId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      // Tìm đơn hàng cần hủy
      const updatedOrders = orders.map((order) => {
        if (order.id === orderId) {
          return { ...order, status: "Đã hủy" };
        }
        return order;
      });

      // Giả lập API call
      setTimeout(() => {
        setOrders(updatedOrders);
        setFilteredOrders((prevFiltered) => {
          return prevFiltered.map((order) => {
            if (order.id === orderId) {
              return { ...order, status: "Đã hủy" };
            }
            return order;
          });
        });

        // Hiển thị thông báo
        toast.success("Đơn hàng đã được hủy thành công!");
      }, 500);
    }
  };

  // 🛠️ Hàm xử lý mua lại
  const handleReorder = (order: Order) => {
    // Giả lập thêm vào giỏ hàng
    setTimeout(() => {
      toast.success(
        <div>
          <div className="font-medium">Đã thêm vào giỏ hàng</div>
          <div className="text-xs">
            {order.items} sản phẩm đã được thêm vào giỏ hàng
          </div>
        </div>
      );
    }, 300);
  };

  // 🛠️ Hàm xử lý in hóa đơn
  const handlePrintInvoice = (orderNumber: string) => {
    toast.success(`Đang chuẩn bị hóa đơn cho đơn hàng ${orderNumber}...`);
    // Giả lập tải hóa đơn
    setTimeout(() => {
      toast.success("Hóa đơn đã sẵn sàng để in!");
    }, 1500);
  };

  // ⌛ Loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center my-16">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Đơn hàng của tôi | Tài khoản người dùng</title>
        <meta
          name="description"
          content="Quản lý, theo dõi đơn hàng của bạn một cách nhanh chóng và dễ dàng."
        />
        <meta name="robots" content="index, follow" />
        <link
          rel="canonical"
          href="https://decorandmore.vn/tai-khoan/don-hang"
        />
        <meta property="og:title" content="Đơn hàng của tôi" />
        <meta
          property="og:description"
          content="Quản lý, theo dõi đơn hàng của bạn một cách nhanh chóng và dễ dàng."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://decorandmore.vn/tai-khoan/don-hang"
        />
        {/* Bạn có thể thay đổi URL hình ảnh đại diện phù hợp nếu có */}
        <meta property="og:image" content="/images/og-orders.jpg" />
      </Head>

      {/*
        NOTE: <main> should NOT be rendered inside a <p>.
        If you are using this component inside a context where a <p> is a parent,
        wrap this <main> in a <div> or <section> instead.
      */}
      <div className="max-w-4xl mx-auto" role="main">
        <PageHeader
          title="Đơn hàng của tôi"
          description="Theo dõi và quản lý các đơn hàng của bạn"
        />

        {/* Thanh tìm kiếm và bộ lọc */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Thanh tìm kiếm */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm đơn hàng hoặc sản phẩm..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white text-sm"
              />
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  <IoClose />
                </button>
              )}
            </div>

            {/* Nút mở bộ lọc */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${isFilterOpen
                ? "bg-blue-50 text-blue-600 border border-blue-200"
                : "bg-gray-50/80 text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
            >
              <IoFilter className="text-lg" />
              <span>Bộ lọc</span>
              {(selectedStatus !== "Tất cả" ||
                dateRange.from ||
                dateRange.to) && (
                  <span className="flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs rounded-full">
                    {(selectedStatus !== "Tất cả" ? 1 : 0) +
                      (dateRange.from || dateRange.to ? 1 : 0)}
                  </span>
                )}
            </button>
          </div>

          {/* Bộ lọc mở rộng */}
          {isFilterOpen && (
            <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden transition-all">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Lọc theo trạng thái */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                    Trạng thái
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Tất cả", "Đang giao hàng", "Đã giao hàng", "Đã hủy"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() =>
                            setSelectedStatus(status as OrderStatus)
                          }
                          className={`px-3 py-1.5 text-sm rounded-md transition-all ${selectedStatus === status
                            ? "bg-blue-50 text-blue-600 border border-blue-200"
                            : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                            }`}
                        >
                          {status}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mt-4">
                {/* Lọc theo thời gian từ */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                    Từ ngày
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, from: e.target.value })
                      }
                      className="w-full py-1.5 pl-9 pr-3 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white text-sm"
                    />
                    <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  </div>
                </div>

                {/* Lọc theo thời gian đến */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                    Đến ngày
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, to: e.target.value })
                      }
                      className="w-full py-1.5 pl-9 pr-3 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white text-sm"
                    />
                    <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  </div>
                </div>
              </div>

              {/* Nút xóa bộ lọc */}
              <div className="mt-0 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors py-1.5 px-3 hover:bg-blue-50 rounded-md"
                >
                  <FaTimes className="text-xs" />
                  <span>Xóa bộ lọc</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white py-12 px-6 border border-gray-200 rounded-lg text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
              <IoSearch className="text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy đơn hàng
            </h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              Không có đơn hàng nào phù hợp với điều kiện tìm kiếm của bạn.
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <FaUndo className="text-xs" />
              <span>Xóa bộ lọc</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm transition-all hover:shadow-md"
              >
                {/* Header đơn hàng */}
                <div
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors ${expandedOrders[order.id]
                    ? "bg-gray-50"
                    : "hover:bg-gray-50/50"
                    }`}
                  onClick={() => toggleOrderDetails(order.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Mã đơn hàng */}
                    <div className="font-medium text-gray-900">
                      {order.orderNumber}
                    </div>

                    {/* Ngày đặt hàng */}
                    <div className="text-gray-500 text-sm flex items-center gap-1.5">
                      <FaCalendarAlt className="text-xs text-gray-400" />
                      {order.date}
                    </div>

                    {/* Trạng thái */}
                    <div
                      className={`flex items-center gap-1.5 text-sm ${getStatusColor(order.status).text
                        } ${getStatusColor(order.status).bg
                        } py-0.5 px-2 rounded-md w-fit`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${getStatusColor(order.status).dot
                          }`}
                      ></span>
                      {renderStatus(order.status)}
                    </div>
                  </div>

                  {/* Tổng tiền và nút xem chi tiết */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="font-medium">
                      {formatPrice(order.total)}
                    </div>
                    <div
                      className={`flex items-center gap-1 text-blue-600 transition-colors ${expandedOrders[order.id] ? "" : "hover:text-blue-800"
                        }`}
                    >
                      {expandedOrders[order.id] ? (
                        <>
                          <span>Ẩn chi tiết</span>
                          <IoChevronUp />
                        </>
                      ) : (
                        <>
                          <span>Xem chi tiết</span>
                          <IoChevronDown />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chi tiết sản phẩm trong đơn hàng */}
                {expandedOrders[order.id] && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="space-y-3">
                      {order.products.map((product) => (
                        <div
                          key={product.id}
                          className="flex gap-3 py-3 border-b border-gray-100 last:border-0 last:pb-0"
                        >
                          {/* Hình ảnh sản phẩm */}
                          <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Thông tin sản phẩm */}
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/product/${product.slug}`}
                              className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-sm line-clamp-2"
                            >
                              {product.name}
                            </Link>
                            {product.variant && (
                              <p className="text-xs text-gray-500 mt-1">
                                {product.variant}
                              </p>
                            )}
                          </div>

                          {/* Giá và số lượng */}
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-medium text-gray-900">
                              {formatPrice(product.price * product.quantity)}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {formatPrice(product.price)} × {product.quantity}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Tổng kết đơn hàng */}
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex flex-col items-end text-sm">
                          <div className="w-full sm:w-48 flex justify-between mb-1">
                            <span className="text-gray-500">Tạm tính:</span>
                            <span className="text-gray-700">
                              {formatPrice(order.total)}
                            </span>
                          </div>
                          <div className="w-full sm:w-48 flex justify-between mb-1">
                            <span className="text-gray-500">
                              Phí vận chuyển:
                            </span>
                            <span className="text-gray-700">Miễn phí</span>
                          </div>
                          <div className="w-full sm:w-48 flex justify-between pt-2 border-t border-dashed border-gray-200 mt-2">
                            <span className="font-medium text-gray-900">
                              Tổng cộng:
                            </span>
                            <span className="font-medium text-gray-900">
                              {formatPrice(order.total)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Các nút hành động */}
                      <div className="flex flex-wrap justify-end gap-2 pt-4">
                        <button
                          onClick={() => handlePrintInvoice(order.orderNumber)}
                          className="flex items-center gap-1.5 text-gray-600 bg-white border border-gray-200 rounded-md px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <FaFileInvoice className="text-xs" />
                          <span>In hóa đơn</span>
                        </button>

                        {order.status === "Đang giao hàng" && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="flex items-center gap-1.5 text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-1.5 text-sm hover:bg-red-100 transition-colors"
                          >
                            <FaTimes className="text-xs" />
                            <span>Hủy đơn hàng</span>
                          </button>
                        )}

                        {order.status === "Đã giao hàng" && (
                          <button
                            onClick={() => handleReorder(order)}
                            className="flex items-center gap-1.5 text-white bg-blue-600 border border-blue-600 rounded-md px-3 py-1.5 text-sm hover:bg-blue-700 transition-colors"
                          >
                            <FaUndo className="text-xs" />
                            <span>Mua lại</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default OrderSection
