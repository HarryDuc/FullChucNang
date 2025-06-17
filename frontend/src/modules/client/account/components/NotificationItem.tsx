import { FaBoxOpen, FaRegCreditCard, FaRegUser } from "react-icons/fa";


// 🔔 Interface cho thông báo
interface Notification {
  id: string;
  type: "order" | "info" | "promo";
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}

// 🔔 Component cho thông báo
const NotificationItem = ({
  notification,
  onMarkAsRead,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}) => {
  const getTypeStyle = (type: Notification["type"]) => {
    switch (type) {
      case "order":
        return {
          bg: "bg-blue-50 border-blue-200",
          icon: <FaBoxOpen className="text-blue-600" />,
        };
      case "promo":
        return {
          bg: "bg-emerald-50 border-emerald-200",
          icon: <FaRegCreditCard className="text-emerald-600" />,
        };
      case "info":
        return {
          bg: "bg-amber-50 border-amber-200",
          icon: <FaRegUser className="text-amber-600" />,
        };
      default:
        return {
          bg: "bg-gray-50 border-gray-200",
          icon: <FaRegUser className="text-gray-600" />,
        };
    }
  };

  const typeStyle = getTypeStyle(notification.type);

  return (
    <div
      className={`p-3 border rounded-lg mb-2 ${notification.isRead ? "bg-white" : `${typeStyle.bg} border-l-4`
        }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          <div className="mt-0.5">{typeStyle.icon}</div>
          <div>
            <div
              className={`font-medium text-sm ${notification.isRead ? "" : "text-gray-900"
                }`}
            >
              {notification.title}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {notification.message}
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500">{notification.date}</div>
      </div>
      {!notification.isRead && (
        <div className="mt-2 text-right">
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Đánh dấu đã đọc
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;
