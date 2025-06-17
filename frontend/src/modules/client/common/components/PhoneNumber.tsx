"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  FaPhoneAlt,
  FaFacebookF,
  FaYoutube,
  FaArrowUp,
  FaWhatsapp,
} from "react-icons/fa";
import { useInfoWebsite } from "@/modules/client/common/hooks/useInfoWebsite";

declare global {
  interface Window {
    ScrollToTop?: (event: React.MouseEvent) => void;
  }
}

type IconType = {
  type: "react-icon" | "image";
  icon?: React.ElementType;
  imageSrc?: string;
};

interface ButtonType {
  href: string;
  title: string;
  iconData: IconType;
  color: string;
  label: string;
  subLabel: string;
  animate: boolean;
}

const ContactButtons = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { contact } = useInfoWebsite();
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Xử lý cuộn lên đầu trang
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  useEffect(() => {
    window.ScrollToTop = (event: React.MouseEvent) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  }, []);

  const buttons: ButtonType[] = [
    {
      href: `tel:${contact?.hotline}`,
      title: contact?.hotline || "Chưa cập nhật",
      iconData: {
        type: "react-icon",
        icon: FaPhoneAlt,
      },
      color: "orange-600",
      label: "Hotline",
      subLabel: contact?.hotline || "Chưa cập nhật",
      animate: true,
    },
    {
      href: `https://zalo.me/${contact?.zalo}`,
      title: "Zalo",
      iconData: {
        type: "image",
        imageSrc: "/image/zalo-color.png",
      },
      color: "blue-600",
      label: "Zalo",
      subLabel: contact?.zalo || "Chưa cập nhật",
      animate: true,
    },
    {
      href: `https://wa.me/${contact?.whatsapp}`,
      title: "Whatsapp",
      iconData: {
        type: "react-icon",
        icon: FaWhatsapp,
      },
      color: "green-600",
      label: "Whatsapp",
      subLabel: contact?.whatsapp || "Chưa cập nhật",
      animate: true,
    },
    {
      href: `https://www.facebook.com/${contact?.facebook}`,
      title: "Facebook",
      iconData: {
        type: "react-icon",
        icon: FaFacebookF,
      },
      color: "blue-800",
      label: "Facebook",
      subLabel: contact?.facebook || "Chưa cập nhật",
      animate: false,
    },
    {
      href: `https://www.youtube.com/${contact?.youtube}`,
      title: "YouTube",
      iconData: {
        type: "react-icon",
        icon: FaYoutube,
      },
      color: "red-600",
      label: "YouTube",
      subLabel: contact?.youtube || "Chưa cập nhật",
      animate: false,
    },
  ];

  const renderIcon = (iconData: IconType) => {
    if (iconData.type === "react-icon" && iconData.icon) {
      const Icon = iconData.icon;
      return <Icon size={20} />;
    } else if (iconData.type === "image" && iconData.imageSrc) {
      return (
        <Image
          src={iconData.imageSrc}
          alt="icon"
          width={28}
          height={28}
          className="w-6 h-6 object-contain"
        />
      );
    }
    return null;
  };

  const getBackgroundColor = (color: string) => {
    switch (color) {
      case "orange-600":
        return "#ea580c";
      case "blue-600":
        return "#2563eb";
      case "green-600":
        return "#10b981";
      case "blue-800":
        return "#1e40af";
      case "red-600":
        return "#dc2626";
      default:
        return "#ffffff";
    }
  };

  return (
    <div>
      <div className="fixed top-1/2 -translate-y-1/2 right-0 z-50">
        <div className="relative bg-white/90 backdrop-blur-sm rounded-l-2xl shadow-xl p-3 space-y-4">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-24 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>

          {buttons.map((btn, idx) => (
            <div key={idx} className="relative group">
              <Link
                href={btn.href}
                target="_blank"
                rel="nofollow"
                title={btn.title}
                className="inline-block"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-xl ${
                    btn.animate ? "hover:animate-ring" : ""
                  }`}
                  style={{ backgroundColor: getBackgroundColor(btn.color) }}
                >
                  <div className="text-white">{renderIcon(btn.iconData)}</div>
                </div>
              </Link>

              <div
                className="pointer-events-none absolute top-1/2 -translate-y-1/2 right-[calc(100%+12px)] bg-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 min-w-[120px]"
                style={{ color: getBackgroundColor(btn.color) }}
              >
                <p className="text-sm font-semibold whitespace-nowrap">
                  {btn.label}
                </p>
                <p className="text-xs whitespace-nowrap">{btn.subLabel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        className={`fixed bottom-10 right-2 z-50 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={scrollToTop}
          className="rounded-xl w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-md transition-all duration-300 hover:shadow-lg"
          aria-label="Cuộn lên đầu trang"
        >
          <FaArrowUp />
        </button>
      </div>
    </div>
  );
};

export default ContactButtons;
