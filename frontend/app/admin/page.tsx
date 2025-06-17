"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import AdminPage from "@/modules/admin/pages";

export default function Page() {
  const {
    isAuthenticated,
    verifyToken,
    user,
    hasAdminAccess,
    fetchUserPermissions,
    isLoadingPermissions,
  } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  // Khởi tạo: Kiểm tra token và tải permissions
  useEffect(() => {
    const initAdmin = async () => {
      try {
        console.log("🔍 Admin Page - Verifying token...");
        // Xác thực token
        await verifyToken();

        // Nếu đã đăng nhập, luôn tải permissions
        if (isAuthenticated && user) {
          console.log("🔄 Loading permissions...");
          await fetchUserPermissions();
        }

        setPermissionsLoaded(true);
        setIsLoading(false);
      } catch (error) {
        console.error("❌ Error initializing admin page:", error);
        setIsLoading(false);
      }
    };

    initAdmin();
  }, []);

  // Xử lý sau khi đã tải xong
  useEffect(() => {
    // Đợi cho đến khi hoàn tất tải và kiểm tra permissions
    if (isLoading || isLoadingPermissions) return;

    const userDebugInfo = user
      ? {
          id: user.id,
          role: user.role,
          hasPermissions: user.permissions?.length > 0,
          permissions: user.permissions
            ?.map((p) => `${p.resource}:${p.action}`)
            .slice(0, 5),
        }
      : null;

    console.log("🔒 Checking admin access:", {
      isAuthenticated,
      user: userDebugInfo,
      hasAdminAccess: hasAdminAccess(),
      permissionsLoaded,
    });

    // Kiểm tra xác thực
    if (!isAuthenticated || !user) {
      console.warn("🚫 Not authenticated, redirecting to login...");
      router.replace("/login");
      return;
    }

    // Kiểm tra quyền truy cập sau khi đã tải permissions
    if (permissionsLoaded && !hasAdminAccess()) {
      console.warn("🚫 No admin access permissions, redirecting to home...");
      router.replace("/");
      return;
    }

    console.log("✅ Admin access verified, showing admin page");
  }, [
    isAuthenticated,
    user,
    router,
    isLoading,
    hasAdminAccess,
    isLoadingPermissions,
    permissionsLoaded,
  ]);

  // Hiển thị loading
  if (isLoading || isLoadingPermissions) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Đang tải...</h1>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập</p>
        </div>
      </div>
    );
  }

  // Kiểm tra lại quyền truy cập trước khi render
  if (!isAuthenticated || !hasAdminAccess()) {
    return null; // Sẽ được chuyển hướng bởi useEffect
  }

  return <AdminPage />;
}
