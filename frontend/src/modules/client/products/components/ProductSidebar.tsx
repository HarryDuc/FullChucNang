import React from "react";
import Link from "next/link";

const ProductSidebar: React.FC = () => (
  <aside className="lg:col-span-3 space-y-6">
    <div className="border border-gray-200 overflow-hidden group rounded-lg bg-white">
      <Link href="/about" className="block no-underline">
        <div className="relative w-full bg-white">
          <img
            src="/image/bg.png"
            alt="Décor & More - Bring Your Home To Life"
            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-lg"
            sizes="(max-width: 1024px) 100vw, 25vw"
          />
        </div>
      </Link>
    </div>
    <div className="sticky top-28 z-40 pt-2">
      <div className="border border-gray-200 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4 pb-2 border-b border-gray-200">Chính sách mua hàng</h3>
        <ul className="space-y-3">
          <li className="flex gap-2 items-start"><div className="text-blue-900 mt-1 flex-shrink-0">✓</div><span className="text-gray-600">Giao hàng toàn quốc</span></li>
          <li className="flex gap-2 items-start"><div className="text-blue-900 mt-1 flex-shrink-0">✓</div><span className="text-gray-600">Thanh toán khi nhận hàng</span></li>
          <li className="flex gap-2 items-start"><div className="text-blue-900 mt-1 flex-shrink-0">✓</div><span className="text-gray-600">Đổi trả trong 7 ngày</span></li>
          <li className="flex gap-2 items-start"><div className="text-blue-900 mt-1 flex-shrink-0">✓</div><span className="text-gray-600">Bảo hành 12 tháng</span></li>
          <li className="flex gap-2 items-start"><div className="text-blue-900 mt-1 flex-shrink-0">✓</div><span className="text-gray-600">Tư vấn 24/7</span></li>
        </ul>
      </div>
      <div className="bg-blue-900 text-white p-4 text-center mt-4 rounded-lg shadow">
        <p className="font-bold mb-1 text-md">HOTLINE HỖ TRỢ</p>
        <p className="text-lg font-bold tracking-wide">0919 14 04 90</p>
      </div>
    </div>
  </aside>
);

export default ProductSidebar;