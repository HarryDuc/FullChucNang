"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ReactNode } from "react";
import { toast } from "react-hot-toast";
interface AdminGuardProps {
  children: ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const {
    isAuthenticated,
    hasAdminAccess,
    hasPermission,
    hasPathPermission,
    isLoadingPermissions,
    user,
    verifyToken,
  } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [checkAttempts, setCheckAttempts] = useState(0);

  useEffect(() => {
    // Phát hiện token trong localStorage và đảm bảo người dùng đã được xác thực
    const ensureAuthenticated = async () => {
      const token = localStorage.getItem("token");
      if (token && !isAuthenticated && checkAttempts < 3) {
        console.log(
          "🔄 Token found but not authenticated, trying to verify token..."
        );
        await verifyToken(token);
        setCheckAttempts((prev) => prev + 1);
      }
    };

    ensureAuthenticated();
  }, [isAuthenticated, verifyToken, checkAttempts]);

  useEffect(() => {
    const checkAccess = async () => {
      setIsChecking(true);

      // Nếu đang load permissions thì chờ
      if (isLoadingPermissions) {
        console.log("⏳ Still loading permissions, waiting...");
        return;
      }

      // Kiểm tra xem có token trong localStorage không
      const hasToken = !!localStorage.getItem("token");

      console.log("🔒 AdminGuard checking access with data:", {
        isAuthenticated,
        hasToken,
        hasAdminRole: user?.role === "admin",
        userRole: user?.role,
        permissionCount: user?.permissions?.length || 0,
        pathname,
      });

      // Nếu chưa đăng nhập, chuyển về login
      if (!isAuthenticated) {
        if (hasToken && checkAttempts < 3) {
          console.log(
            "⚠️ Has token but not authenticated, waiting for auth state to update..."
          );
          return; // Đợi cho xác thực hoàn tất ở useEffect trên
        }

        console.log("🚫 User not authenticated");
        router.replace("/login");
        return;
      }

      // Nếu không có quyền admin/staff/manager, chuyển về login
      if (!hasAdminAccess()) {
        console.log("🚫 User has no admin access");
        toast.error("Bạn không có quyền truy cập trang quản trị");
        router.replace("/login");
        return;
      }

      // Nếu là trang dashboard, cho phép truy cập
      if (pathname === "/admin") {
        console.log("✅ Admin dashboard access granted");
        setIsChecking(false);
        return;
      }

      // Kiểm tra quyền truy cập dựa trên đường dẫn
      const hasAccess = hasPathPermission(pathname);

      console.log(
        `🔍 Path permission check result for ${pathname}:`,
        hasAccess
      );

      if (!hasAccess) {
        console.log(`🚫 User lacks permission for path: ${pathname}`);
        toast.error("Bạn không có quyền truy cập trang này");
        router.replace("/admin");
        return;
      }

      console.log("✅ Access check passed for:", pathname);
      setIsChecking(false);
    };

    checkAccess();
  }, [
    isAuthenticated,
    hasAdminAccess,
    hasPermission,
    hasPathPermission,
    router,
    pathname,
    isLoadingPermissions,
    user,
    checkAttempts,
  ]);

  // Show loading spinner while checking permissions
  if (isLoadingPermissions || isChecking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mb-3 mx-auto"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
          {checkAttempts > 0 && (
            <p className="text-gray-500 text-sm mt-2">
              Đang thử lại lần {checkAttempts}/3...
            </p>
          )}
        </div>
      </div>
    );
  }

  // If not authenticated or no admin access, show nothing (will be redirected)
  if (!isAuthenticated || !hasAdminAccess()) {
    return null;
  }

  // Nếu là trang dashboard, luôn hiển thị nội dung
  if (pathname === "/admin") {
    return <>{children}</>;
  }

  // Sử dụng hasPathPermission để kiểm tra quyền truy cập cho tất cả các đường dẫn khác
  if (!hasPathPermission(pathname)) {
    return null;
  }

  // If all checks pass, render children
  return <>{children}</>;
};

export default AdminGuard;
