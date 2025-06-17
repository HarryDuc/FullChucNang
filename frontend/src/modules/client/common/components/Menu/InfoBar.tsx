import { FaBolt, FaCheckCircle, FaShippingFast, FaTag, FaUndoAlt } from "react-icons/fa";

export default function InfoBar() {
  const infoBarItems: { icon: React.ReactNode; label: string; desc?: string }[] = [
    { icon: <FaCheckCircle className="text-blue-500 text-sm" />, label: "Cam kết", desc: "100% hàng thật" },
    { icon: <FaShippingFast className="text-blue-500 text-sm" />, label: "Freeship mọi đơn" },
    { icon: <FaUndoAlt className="text-blue-500 text-sm" />, label: "Hoàn 200% nếu hàng giả" },
    { icon: <FaBolt className="text-blue-500 text-sm" />, label: "30 ngày đổi trả" },
    { icon: <FaTag className="text-blue-500 text-sm" />, label: "Giao nhanh 2h" },
    { icon: <FaTag className="text-blue-500 text-sm" />, label: "Giá siêu rẻ" },
  ];
  return (
    <div className=" bg-white hidden md:flex">
      <div className="container mx-auto flex flex-wrap items-center space-x-4 md:space-x-8 px-1 py-2">
          {infoBarItems.map((item: { icon: React.ReactNode; label: string; desc?: string }, idx: number) => (
            <div key={idx} className="flex items-center space-x-1 md:space-x-2 mb-1 md:mb-0 z-10">
              {item.icon}
              <span className="text-xs md:text-sm font-semibold text-gray-700">{item.label}</span>
              {item.desc && <span className="text-[10px] md:text-xs text-gray-500 ml-1">{item.desc}</span>}
            </div>
          ))}
        </div>
    </div>
  )
}