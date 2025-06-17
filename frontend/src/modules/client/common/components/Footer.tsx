"use client";

import { FaFacebookF, FaYoutube } from "react-icons/fa";
import { SiShopee, SiTiktok } from "react-icons/si";
import Link from "next/link";
import { useInfoWebsite } from "@/modules/client/common/hooks/useInfoWebsite";
const aboutUsLinks = [
  { label: "Giới thiệu", href: "/about" },
  { label: "Liên hệ", href: "/contact" },
  { label: "Chính sách mua hàng", href: "/purchase-policy" },
  { label: "Chính sách đổi trả hàng", href: "/return-policy" },
  { label: "Chính sách bảo hành", href: "/return-policy" },
  { label: "Chính sách bảo mật thông tin cá nhân", href: "/privacy-policy" },
];

const mainCategories = [
  [
    { label: "Home Decor", href: "/category/home-decor" },
    { label: "Decor Cao Cấp", href: "/category/decor-cao-cap" },
    { label: "Đồng Hồ Trang Trí", href: "/category/dong-ho-trang-tri" },
  ],
  [
    { label: "Mô Hình Xe Vintage", href: "/category/mo-hinh-xe-vintage" },
    { label: "Quà Tặng Nghệ Thuật", href: "/category/qua-tang-nghe-thuat" },
    { label: "Gối Sofa", href: "/category/goi-sofa" },
  ],
  [
    { label: "Quả Địa Cầu", href: "/category/qua-dia-cau" },
    { label: "Đồ Phong Thủy", href: "/category/do-phong-thuy" },
    { label: "Tranh Canvas", href: "/category/tranh-canvas" },
  ],
  [
    { label: "Đồ Gia Dụng", href: "/category/ke-tu" },
    { label: "Sản Phẩm Khác", href: "/category/san-pham-khac" },
  ],
];

const Footer = () => {
  const { contact } = useInfoWebsite();
  return (
    <footer className="bg-gray-900 text-white pt-10 w-full mt-auto">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
        {/* Column 1 - DÉCOR & MORE */}
        <div>
          <h3 className="text-lg font-bold text-orange-400 mb-4">
            {contact?.name || "Chưa cập nhật"}
          </h3>
          <ul className=" list-none space-y-1">
            <li>
              <strong className="text-orange-400">Công Ty:</strong>{" "}
              {contact?.company_name || "Chưa cập nhật"}
            </li>
            <li>
              <strong className="text-orange-400">MST:</strong>{" "}
              {contact?.mst || "Chưa cập nhật"}
            </li>
            <li>
              <strong className="text-orange-400">GPKD cấp ngày:</strong> 03
              tháng 04 năm 2025
            </li>
            <li>
              <strong className="text-orange-400">Hotline:</strong>
              <a
                href="tel:0919140490"
                className="text-white no-underline hover:text-orange-400 transition-all duration-300 ease-in-out ml-2"
              >
                {contact?.hotline || "Chưa cập nhật"} &nbsp;(24/7)
              </a>
            </li>
            <li>
              <strong className="text-orange-400">Email:</strong>
              <a
                href="mailto:decorandmore.vn@gmail.com"
                className="text-white no-underline hover:text-orange-400 transition-all duration-300 ease-in-out ml-2"
              >
                {contact?.email || "Chưa cập nhật"}
              </a>
            </li>
            <li>
              <strong className="text-orange-400">Địa Chỉ:</strong>{" "}
              {contact?.address || "Chưa cập nhật"}
            </li>
          </ul>
        </div>

        {/* Column 2 - VỀ CHÚNG TÔI */}
        <div>
          <h3 className="text-lg font-bold text-orange-400 mb-4">
            VỀ CHÚNG TÔI
          </h3>
          <ul className="space-y-2 pl-0 list-none">
            {aboutUsLinks.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className="text-white no-underline hover:text-orange-400 transition-all duration-300 ease-in-out"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3 - DANH MỤC CHÍNH */}
        <div>
          <h3 className="text-lg font-bold text-orange-400 mb-4">
            DANH MỤC CHÍNH
          </h3>
          <ul className="space-y-2 pl-0 list-none">
            {mainCategories.map((group, index) => (
              <li key={index} className="flex flex-wrap gap-2">
                {group.map((item, i) => (
                  <span key={i}>
                    <Link
                      href={item.href}
                      className="text-white no-underline hover:text-orange-400 transition-all duration-300 ease-in-out"
                    >
                      {item.label}
                    </Link>
                    {i < group.length - 1 && (
                      <span className="text-orange-400 mx-2">|</span>
                    )}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* dich vu */}
      <div className="container mx-auto px-6 mt-2 text-center">
        <h3 className="text-lg font-bold text-orange-400 mb-2">
          KẾT NỐI VỚI CHÚNG TÔI
        </h3>
        <div className="flex gap-6 items-center justify-center mt-2">
          <a
            href="https://www.facebook.com/decorandmorevietnam/"
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label="Facebook - Decor and More"
            title="Facebook - Decor and More"
            className="text-white text-lg flex items-center justify-center transition-all duration-300 hover:scale-105 hover:text-[#1877f2]"
          >
            <FaFacebookF />
          </a>
          <a
            href="https://www.youtube.com/@decorandmorevn"
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label="YouTube - Decor and More"
            title="YouTube - Decor and More"
            className="text-white text-xl flex items-center justify-center transition-all duration-300 hover:scale-105 hover:text-[#ff0000]"
          >
            <FaYoutube />
          </a>
          <a
            href="https://www.tiktok.com/@decorandmore.vn?is_from_webapp=1&sender_device=pc"
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label="TikTok - Decor and More"
            title="TikTok - Decor and More"
            className="text-white text-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 hover:text-[#010101]"
          >
            <SiTiktok />
          </a>
          <a
            href="https://shopee.vn/decor_and_more_vn?categoryId=100636&itemId=12411044479"
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label="Shopee - Decor and More"
            title="Shopee - Decor and More"
            className="text-white text-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 hover:text-[#ff6600]"
          >
            <SiShopee />
          </a>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 p-4 text-center text-gray-400 text-sm">
        © 2020 - Bản quyền của Décor & More. Thiết kế bởi&nbsp;
        <a
          href="https://yaviet.com"
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="no-underline hover:text-orange-400"
        >
          &nbsp;Yaviet.com&nbsp;
        </a>
      </div>
    </footer>
  );
};

export default Footer;
