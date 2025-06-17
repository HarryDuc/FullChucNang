"use client";

import { ReactNode, useState } from "react";
import Menu from "@/modules/client/common/components/Menu";
import Footer from "@/modules/client/common/components/Footer";
import SidebarCategoryPost from "../../posts/components/SidebarCategoryPost";
import ParentCategoryPost from "../../posts/components/ParentCategoryPost";
import { SmallPostList } from "../../posts/components/SmallPostList";
import type { Post } from "@/modules/client/posts/models/post.model";

interface LayoutProps {
  children: ReactNode;
  sidebarPosts?: Post[]; // ✅ Truyền danh sách bài viết nổi bật từ ngoài vào
}

const PostLayout = ({ children, sidebarPosts = [] }: LayoutProps) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  return (
    <div className="flex flex-col min-h-screen">
      {/* 🏠 Header */}
      <Menu />

      {/* 📌 Nội dung chính */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="border-b py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Tin Tức & Bài Viết
            </h1>
            <div className="hidden md:block">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Hiển thị danh mục bài viết ngang */}
        <div className="mb-8 pt-3 overflow-x-auto scrollbar-hide">
          <ParentCategoryPost
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 📄 Nội dung chính bên trái */}
          <section className="lg:col-span-9">{children}</section>

          {/* 📂 Sidebar bên phải */}
          <aside className="lg:col-span-3">
            <div className="sticky top-32 space-y-6">
              <SidebarCategoryPost />

              {sidebarPosts.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold mb-4 border-b pb-2">
                    Bài Viết Nổi Bật
                  </h3>
                  <SmallPostList posts={sidebarPosts.slice(0, 6)} />
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PostLayout;
