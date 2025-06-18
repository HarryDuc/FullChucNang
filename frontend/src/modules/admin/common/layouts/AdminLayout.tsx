"use client";
import AdminMenu from "../components/AdminMenu";
import AdminSidebar from "../components/AdminSidebar";
import { ReactNode, useState, useEffect } from "react";
import AdminGuard from "../components/AdminGuard";

interface LayoutAdminProps {
  children: ReactNode;
}

const LayoutAdmin = ({ children }: LayoutAdminProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Kiểm tra kích thước màn hình khi component được tải
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    // Kiểm tra ban đầu
    checkScreenSize();

    // Thêm event listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminGuard>
      <aside
        className={`${
          sidebarCollapsed ? "w-20" : "w-64"
        } transition-all duration-300 ease-in-out fixed left-0 top-0 h-full bg-white shadow-lg z-30`}
      >
        <AdminSidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        } transition-all duration-300`}
      >
        {/* Top Navigation */}
        <header className="h-20 bg-white shadow-sm fixed top-0 right-0 left-0 z-20 ml-[inherit]">
          <AdminMenu />
        </header>

        {/* Mobile Overlay */}
        {!sidebarCollapsed && isMobile && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Main Content */}
        <main className="pt-16 px-6 py-8">
          <div className="max-w-[1600px] mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">{children}</div>
            </div>
          </main>
        </div>
      </AdminGuard>
    </div>
  );
};

export default LayoutAdmin;
