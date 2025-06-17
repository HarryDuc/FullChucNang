"use client";

import { ReactNode } from "react";
import Menu from "@/modules/client/common/components/Menu";
import Footer from "@/modules/client/common/components/Footer";
import Sidebar from "../../products/components/Sidebar";

interface LayoutProps {
  children: ReactNode;
}

const CategoryProductLayout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5fa]">
      {/* 🏠 Header */}
      <Menu />

      {/* 📌 Nội dung chính: chia 2 cột */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-1 md:gap-2 min-h-screen">
          <aside className="h-[5%] md:h-auto w-full md:w-1/5 sticky top-1 z-[15]">
            <Sidebar />
          </aside>

          {/* 📄 Nội dung chính bên phải */}
          <section className="h-[95%] md:h-auto w-full md:w-4/5">
            {children}
          </section>
        </div>
      </main>

      {/* 📌 Footer */}
      <Footer />

    </div>
  );
};

export default CategoryProductLayout;
