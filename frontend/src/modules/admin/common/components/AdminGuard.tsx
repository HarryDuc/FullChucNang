"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ReactNode } from "react";
import { toast } from "react-hot-toast";

interface AdminGuardProps {
  children: ReactNode;
}

// Map routes to required permissions
const routePermissions: Record<string, { resource: string; action: string }> = {
  "/admin/products": { resource: "products", action: "read" },
  "/admin/users": { resource: "users", action: "read" },
  "/admin/orders": { resource: "orders", action: "read" },
  "/admin/categories-product": {
    resource: "categories-product",
    action: "read",
  },
  "/admin/categories-post": { resource: "categories-post", action: "read" },
  "/admin/posts": { resource: "posts", action: "read" },
  "/admin/banner": { resource: "banner", action: "read" },
  "/admin/contact": { resource: "contact", action: "read" },
  "/admin/create-page": { resource: "create-page", action: "read" },
  "/admin/info-website": { resource: "info-website", action: "read" },
  "/admin/media": { resource: "media", action: "read" },
  "/admin/permission": { resource: "permissions", action: "read" },
  "/admin/scripts": { resource: "scripts", action: "read" },
  "/admin/voucher": { resource: "vouchers", action: "read" },
  "/admin/vietqr-config": { resource: "vietqr", action: "read" },
};

const AdminGuard = ({ children }: AdminGuardProps) => {
  const {
    isAuthenticated,
    hasAdminAccess,
    hasPermission,
    isLoadingPermissions,
  } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAccess = () => {
      // Nếu đang load permissions thì chờ
      if (isLoadingPermissions) return;

      // Nếu chưa đăng nhập, chuyển về login
      if (!isAuthenticated || !hasAdminAccess()) {
        console.log("🚫 User not authenticated");
        router.replace("/login");
        return;
      }

      // Nếu không có quyền admin/staff/manager, chuyển về login
      // if (hasAdminAccess()) {
      //   console.log("🚫 User has admin access");
      //   router.replace("/admin");
      //   return;
      // }

      // Kiểm tra quyền cụ thể cho route hiện tại
      // Bỏ qua kiểm tra với trang /admin (dashboard)
      if (pathname !== "/admin") {
        const permission = routePermissions[pathname];
        if (permission) {
          const hasAccess = hasPermission(
            permission.resource,
            permission.action
          );
          if (!hasAccess) {
            console.log(`🚫 User lacks permission for ${pathname}`);
            toast.error("Bạn không có quyền truy cập trang này");
            router.replace("/admin");
            return;
          }
        }
      }
    };

    checkAccess();
  }, [
    isAuthenticated,
    hasAdminAccess,
    hasPermission,
    router,
    pathname,
    isLoadingPermissions,
  ]);

  // Show loading spinner while checking permissions
  if (isLoadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If not authenticated or no admin access, show nothing (will be redirected)
  if (!isAuthenticated || !hasAdminAccess()) {
    return null;
  }

  // If we're on a specific admin route, check for that route's permission
  if (pathname !== "/admin") {
    const permission = routePermissions[pathname];
    if (permission && !hasPermission(permission.resource, permission.action)) {
      return null;
    }
  }

  // If all checks pass, render children
  return <>{children}</>;
};

export default AdminGuard;
