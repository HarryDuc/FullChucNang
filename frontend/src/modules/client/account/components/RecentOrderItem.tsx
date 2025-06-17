import { FaCalendarAlt } from "react-icons/fa";

import { FaClock } from "react-icons/fa";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
interface RecentOrder {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  itemCount: number;
}
// 📋 Component cho đơn hàng gần đây
const RecentOrderItem = ({ order }: { order: RecentOrder }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Đã giao hàng":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          icon: <IoMdCheckmarkCircleOutline />,
        };
      case "Đang giao hàng":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          icon: <FaClock />,
        };
      case "Đã hủy":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          icon: <FaClock />,
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          icon: <FaClock />,
        };
    }
  };

  const statusStyle = getStatusStyle(order.status);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "đ");
  };

  return (
    <div className="p-3 border rounded-lg mb-2 bg-white hover:shadow-sm transition-all">
      <div className="flex justify-between items-center">
        <div className="font-medium text-sm">{order.orderNumber}</div>
        <div
          className={`text-xs px-2 py-1 rounded ${statusStyle.bg} ${statusStyle.text} flex items-center gap-1`}
        >
          {statusStyle.icon}
          <span>{order.status}</span>
        </div>
      </div>
      <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <FaCalendarAlt className="text-gray-400" size={12} />
          <span>{order.date}</span>
        </div>
        <div className="font-medium">{formatPrice(order.total)}</div>
      </div>
    </div>
  );
};

export default RecentOrderItem;