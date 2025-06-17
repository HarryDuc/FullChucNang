"use client"; // Required to use hooks in the App Router

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode"; // Use the default export from jwt-decode
import axios from "axios";
import { apiRoutes } from "@/config/apiRoutes";

// User roles
type UserRole = "user" | "admin" | "staff" | "manager" | "technical";

// Permission interfaces
interface Permission {
  id: string;
  resource: string;
  action: string;
}

interface User {
  id: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  hasAdminAccess: () => boolean;
  hasPermission: (resource: string, action: string) => boolean;
  verifyToken: (storedToken?: string) => Promise<void>;
  fetchUserPermissions: () => Promise<Permission[]>;
  isLoadingPermissions: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const router = useRouter();

  // Fetch user permissions from API
  const fetchUserPermissions = useCallback(async (): Promise<Permission[]> => {
    // Đảm bảo sử dụng token từ localStorage nếu state token chưa được cập nhật
    const currentToken = token || localStorage.getItem("token");

    if (!currentToken) {
      console.log("⚠️ Cannot fetch permissions: No token");
      return [];
    }

    setIsLoadingPermissions(true);

    try {
      console.log("🔍 Fetching user permissions from API with token...");
      const response = await axios.get(
        `${BASE_URL}${apiRoutes.AUTH.MY_PERMISSIONS}`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      const { permissions, isAdmin } = response.data;

      console.log(
        `✅ Permissions loaded: ${permissions?.length || 0} permissions`
      );

      if (permissions && Array.isArray(permissions)) {
        // Update user with permissions from API
        setUser((prev) => {
          if (!prev) {
            // Nếu không có user, giải mã token để lấy thông tin cơ bản
            try {
              const decoded = jwtDecode<{
                userId: string;
                email: string;
                role: UserRole;
              }>(currentToken);
              return {
                id: decoded.userId,
                email: decoded.email,
                role: decoded.role,
                permissions: permissions || [],
              };
            } catch (e) {
              console.error(
                "❌ Failed to decode token during permission fetch:",
                e
              );
              return null;
            }
          }

          return {
            ...prev,
            permissions: permissions || [],
          };
        });

        return permissions;
      } else {
        console.error("❌ Invalid permissions format received from API");
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching permissions:", error);
      return [];
    } finally {
      setIsLoadingPermissions(false);
    }
  }, [token]);

  // Setup effect to load token from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for token in localStorage
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          console.log("📝 Found token in localStorage, verifying...");
          setToken(storedToken);
          await verifyToken(storedToken);
        } else {
          console.log("⚠️ No token found in localStorage");
        }
      } catch (error) {
        console.error("❌ Error during initialization:", error);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyToken = async (storedToken?: string): Promise<void> => {
    const tokenToVerify = storedToken || token || localStorage.getItem("token");
    if (!tokenToVerify) {
      console.log("❌ No token found during verification");
      logout();
      return;
    }

    try {
      console.log("🔑 Verifying token...");
      const decodedToken = jwtDecode<{
        userId: string;
        email: string;
        role: UserRole;
        exp: number;
      }>(tokenToVerify);
      console.log("✅ Token decoded successfully:", {
        userId: decodedToken.userId,
        role: decodedToken.role,
      });

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        console.log("❌ Token has expired");
        logout();
        router.replace("/login");
        return;
      }

      // Update token in state and localStorage
      setToken(tokenToVerify);
      localStorage.setItem("token", tokenToVerify);

      // Set basic user info from token
      const basicUser = {
        id: decodedToken.userId,
        email: decodedToken.email,
        role: decodedToken.role,
        permissions: [], // Will be populated by fetchUserPermissions
      };

      setUser(basicUser);
      setIsAuthenticated(true);

      // Fetch permissions after setting basic user info
      const permissions = await fetchUserPermissions();

      console.log(
        `🔒 User authenticated with ${permissions.length} permissions`
      );
    } catch (error) {
      console.error("❌ Token verification failed:", error);
      logout();
    }
  };

  const hasAdminPermissions = (userPermissions: Permission[]): boolean => {
    // Check if user has any admin-level permissions
    return userPermissions.some(
      (permission) =>
        ["users", "permissions"].includes(permission.resource) &&
        [
          "create",
          "update",
          "delete",
          "list",
          "assign",
          "manage-permissions",
          "read",
        ].includes(permission.action)
    );
  };

  const login = async (newToken: string) => {
    try {
      console.log("🔑 Processing login with new token...");
      localStorage.setItem("token", newToken);
      setToken(newToken);

      const decodedToken = jwtDecode<{
        userId: string;
        email: string;
        role: UserRole;
      }>(newToken);

      // Set basic user info
      setUser({
        id: decodedToken.userId,
        email: decodedToken.email,
        role: decodedToken.role,
        permissions: [],
      });

      setIsAuthenticated(true);

      // Fetch permissions immediately after login
      console.log("🔄 Fetching permissions after login...");
      const permissions = await fetchUserPermissions();
      console.log(`✅ Login complete with ${permissions.length} permissions`);

      // Admin role or users with admin permissions go to admin dashboard
      if (decodedToken.role === "admin") {
        router.replace("/admin");
      } else if (
        ["staff", "manager", "technical"].includes(decodedToken.role)
      ) {
        // Staff, manager, technical go to admin but will see limited functionality
        router.replace("/admin");
      } else {
        // Regular users go to home
        router.replace("/");
      }
    } catch (error) {
      console.error("❌ Token decode error during login:", error);
      logout();
    }
  };

  /**
   * Logout function clears the state and redirects to the home page for all users, including admin.
   */
  const logout = () => {
    console.log(
      "🚪 Logging out: Clearing token, updating state, and redirecting to login..."
    );

    // Clear the authentication state
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    // Remove the token from localStorage
    localStorage.removeItem("token");

    // Redirect to login page
    router.replace("/login");
  };

  /**
   * Check admin access based on the new roles.
   */
  const hasAdminAccess = (): boolean => {
    if (!user) {
      console.log("⚠️ No user found in hasAdminAccess check");
      return false;
    }

    // Admin role always has access
    if (user.role === "admin") {
      console.log("✅ User has admin role - granting admin access");
      return true;
    }

    // Staff, manager, technical roles get admin access but will see limited functionality
    if (["staff", "manager", "technical"].includes(user.role)) {
      console.log(`✅ User has ${user.role} role - granting admin access`);
      return true;
    }

    // Allow access if user has at least one permission
    if (user.permissions && user.permissions.length > 0) {
      console.log(
        `✅ User has ${user.permissions.length} permissions - granting admin access`
      );
      return true;
    }

    console.log("❌ User has no admin access rights");
    return false;
  };

  /**
   * Check if user has specific permission
   */
  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) {
      console.log(
        `⚠️ No user found when checking permission: ${resource}:${action}`
      );
      return false;
    }

    // Admin role has all permissions
    if (user.role === "admin") {
      console.log(`✅ Admin user has access to ${resource}:${action}`);
      return true;
    }

    // Staff, manager, technical roles have predefined permissions
    if (
      user.role === "technical" &&
      resource !== "users" &&
      resource !== "permissions"
    ) {
      console.log(`✅ Technical user has access to ${resource}:${action}`);
      return true;
    }

    if (
      user.role === "manager" &&
      !["users", "permissions"].includes(resource)
    ) {
      console.log(`✅ Manager user has access to ${resource}:${action}`);
      return true;
    }

    // Check specific permission for all users if permissions are loaded
    if (user.permissions && user.permissions.length > 0) {
      const hasSpecificPermission = user.permissions.some(
        (permission) =>
          permission.resource === resource && permission.action === action
      );

      if (hasSpecificPermission) {
        console.log(`✅ User has specific permission: ${resource}:${action}`);
        return true;
      }

      console.log(`❌ User lacks permission: ${resource}:${action}`);
      return false;
    } else {
      console.log(`⚠️ No permissions loaded yet for: ${resource}:${action}`);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        verifyToken,
        login,
        logout,
        hasAdminAccess,
        hasPermission,
        fetchUserPermissions,
        isLoadingPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook for using the AuthContext in components.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
