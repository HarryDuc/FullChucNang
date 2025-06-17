"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MdOutlineDashboard,
  MdOutlineShoppingBag,
  MdOutlineFlashOn,
  MdOutlineFolder,
  MdOutlineStyle,
  MdOutlinePeople,
  MdOutlineArticle,
  MdOutlineFolderShared,
  MdOutlineShoppingCart,
  MdOutlinePayment,
  MdOutlineInfo,
  MdOutlinePermMedia,
  MdOutlineViewCarousel,
  MdOutlineCode,
  MdOutlineDiscount,
  MdOutlineSpaceDashboard,
  MdOutlineSecurity,
  MdOutlineEmail,
} from "react-icons/md";
import { useAuth } from "@/context/AuthContext";

interface AdminSidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

interface MenuItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  group?: string;
  requiredPermission?: {
    resource: string;
    action: string;
  };
}

const AdminSidebar = ({ collapsed, toggleSidebar }: AdminSidebarProps) => {
  const pathname = usePathname();
  const { user, hasPermission, fetchUserPermissions } = useAuth();

  // Fetch permissions if not already loaded
  useEffect(() => {
    if (user && (!user.permissions || user.permissions.length === 0)) {
      console.log("🔄 Loading user permissions for AdminSidebar...");
      fetchUserPermissions();
    }
  }, [user, fetchUserPermissions]);

  const menuItems: MenuItem[] = [
    {
      href: "/admin",
      icon: <MdOutlineDashboard />,
      label: "Dashboard",
      group: "Overview",
    },
    {
      href: "/admin/products",
      icon: <MdOutlineShoppingBag />,
      label: "Products",
      group: "E-commerce",
      requiredPermission: {
        resource: "products",
        action: "read",
      },
    },
    {
      href: "/admin/flash-sale",
      icon: <MdOutlineFlashOn />,
      label: "Flash Sale",
      group: "E-commerce",
      requiredPermission: {
        resource: "products",
        action: "read",
      },
    },
    {
      href: "/admin/categories-product",
      icon: <MdOutlineFolder />,
      label: "Categories",
      group: "E-commerce",
      requiredPermission: {
        resource: "categories-product",
        action: "read",
      },
    },
    {
      href: "/admin/orders",
      icon: <MdOutlineShoppingCart />,
      label: "Orders",
      group: "E-commerce",
      requiredPermission: {
        resource: "orders",
        action: "read",
      },
    },
    {
      href: "/admin/voucher",
      icon: <MdOutlineDiscount />,
      label: "Vouchers",
      group: "E-commerce",
      requiredPermission: {
        resource: "vouchers",
        action: "read",
      },
    },
    {
      href: "/admin/users",
      icon: <MdOutlinePeople />,
      label: "Users",
      group: "Management",
      requiredPermission: {
        resource: "users",
        action: "read",
      },
    },
    {
      href: "/admin/permission",
      icon: <MdOutlineSecurity />,
      label: "Permission",
      group: "Management",
      requiredPermission: {
        resource: "permissions",
        action: "read",
      },
    },
    {
      href: "/admin/posts",
      icon: <MdOutlineArticle />,
      label: "Posts",
      group: "Content",
      requiredPermission: {
        resource: "posts",
        action: "read",
      },
    },
    {
      href: "/admin/categories-post",
      icon: <MdOutlineFolderShared />,
      label: "Post Categories",
      group: "Content",
      requiredPermission: {
        resource: "categories-post",
        action: "read",
      },
    },
    {
      href: "/admin/create-page",
      icon: <MdOutlineArticle />,
      label: "Pages",
      group: "Content",
      requiredPermission: {
        resource: "pages",
        action: "read",
      },
    },
    {
      href: "/admin/media",
      icon: <MdOutlinePermMedia />,
      label: "Media",
      group: "Content",
      requiredPermission: {
        resource: "images",
        action: "read",
      },
    },
    {
      href: "/admin/banner",
      icon: <MdOutlineViewCarousel />,
      label: "Banners",
      group: "Content",
      requiredPermission: {
        resource: "banner",
        action: "read",
      },
    },
    {
      href: "/admin/contact",
      icon: <MdOutlineEmail />,
      label: "Contact",
      group: "Content",
      requiredPermission: {
        resource: "contact",
        action: "list",
      },
    },
    {
      href: "/admin/vietqr-config",
      icon: <MdOutlinePayment />,
      label: "VietQR Config",
      group: "Settings",
      requiredPermission: {
        resource: "vietqr-config",
        action: "read",
      },
    },
    {
      href: "/admin/info-website",
      icon: <MdOutlineInfo />,
      label: "Website Info",
      group: "Settings",
      requiredPermission: {
        resource: "info-website",
        action: "read",
      },
    },
    {
      href: "/admin/scripts",
      icon: <MdOutlineCode />,
      label: "Scripts",
      group: "Settings",
      requiredPermission: {
        resource: "script",
        action: "read",
      },
    },
  ];

  // Filter menu items based on user permissions
  const filteredMenuItems = menuItems.filter((item) => {
    // If no permission is required or user is admin, show the item
    if (!item.requiredPermission || user?.role === "admin") {
      return true;
    }

    // Otherwise, check if user has the required permission
    const { resource, action } = item.requiredPermission;
    return hasPermission(resource, action);
  });

  // Group menu items
  const groupedItems = filteredMenuItems.reduce((acc, item) => {
    const group = item.group || "Other";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="h-full bg-[#231d02] flex flex-col">
      {/* Logo */}
      <div
        className={`p-4 ${
          collapsed ? "items-center" : ""
        } border-b border-gray-100 flex`}
      >
          <div className="flex items-center justify-center ml-1 w-10 h-10 rounded-lg bg-white text-black">
            <MdOutlineSpaceDashboard className="text-2xl" />
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none"
              aria-label={collapsed ? "Expand menu" : "Collapse menu"}
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
          {!collapsed && (
        <Link href="/admin" className="flex items-center gap-2 no-underline ml-5">
            <span className="font-semibold text-white text-lg">
              Admin Panel
            </span>
        </Link>
          )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide py-4">
        {Object.entries(groupedItems).map(([group, items]) => (
          <div key={group} className="mb-6">
            {!collapsed && items.length > 0 && (
              <h3 className="px-4 text-xs font-semibold text-white uppercase tracking-wider mb-2">
                {group}
              </h3>
            )}
            <ul className="space-y-1 px-2">
              {items.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href ||
                      pathname?.startsWith(`${item.href}/`);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-white hover:bg-gray-50 hover:text-gray-900"
                      } no-underline ${collapsed ? "justify-center" : ""}`}
                      title={collapsed ? item.label : ""}
                    >
                      <span className="text-xl">{item.icon}</span>
                      {!collapsed && (
                        <span className="text-sm">{item.label}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-100">
          <p className="text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} All Rights Reserved
            <br />
            <a
              href="https://yaviet.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 no-underline"
            >
              Designed by yaviet.com
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar;
