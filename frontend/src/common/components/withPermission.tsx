"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface PermissionProps {
  resource: string;
  action: string;
}

export const withPermission = (
  WrappedComponent: React.ComponentType,
  { resource, action }: PermissionProps
) => {
  return function PermissionWrapper(props: any) {
    const {
      hasPermission,
      isAuthenticated,
      user,
      fetchUserPermissions,
      isLoadingPermissions,
    } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
      const checkAccess = async () => {
        try {
          // Kiểm tra đăng nhập trước
          if (!isAuthenticated) {
            console.log("🔒 User not authenticated, redirecting to login...");
            router.replace("/login");
            setIsLoading(false);
            return;
          }

          console.log(`🔍 Checking access to ${resource}:${action}`);

          // Đảm bảo đã có user trước khi kiểm tra
          if (!user) {
            console.log("⏳ User data not loaded yet, waiting...");
            setIsLoading(true);
            return; // Đợi user data được tải
          }

          // Admin có tất cả quyền
          if (user.role === "admin") {
            console.log("✅ User is admin, granting access");
            setHasAccess(true);
            setIsLoading(false);
            return;
          }

          // Nếu chưa có permissions hoặc đang tải, tải lại từ API
          if (
            (!user.permissions || user.permissions.length === 0) &&
            !isLoadingPermissions
          ) {
            console.log("🔄 No permissions found, fetching from API...");
            await fetchUserPermissions();
            return; // Sẽ trigger useEffect lần nữa khi user.permissions được cập nhật
          }

          // Đợi cho đến khi permissions được tải xong
          if (isLoadingPermissions) {
            console.log("⏳ Permissions are still loading...");
            return; // Đợi permissions được tải xong
          }

          // Kiểm tra quyền sau khi permissions đã được tải
          const hasRequiredPermission = hasPermission(resource, action);
          console.log(
            `Permission check result: ${
              hasRequiredPermission ? "Granted ✅" : "Denied ❌"
            }`
          );
          setHasAccess(hasRequiredPermission);

          if (!hasRequiredPermission) {
            console.log(
              `⛔ Access denied for ${resource}:${action}, redirecting...`
            );
            router.replace("/unauthorized");
          }

          setIsLoading(false);
        } catch (error) {
          console.error("Error in permission check:", error);
          setIsLoading(false);
          setHasAccess(false);
        }
      };

      checkAccess();
    }, [
      isAuthenticated,
      user,
      hasPermission,
      router,
      fetchUserPermissions,
      resource,
      action,
      isLoadingPermissions,
    ]);

    // Hiển thị loading khi đang kiểm tra
    if (isLoading || isLoadingPermissions) {
      return <div>Đang kiểm tra quyền truy cập...</div>;
    }

    // Hiển thị component nếu có quyền
    return hasAccess ? <WrappedComponent {...props} /> : null;
  };
};
