"use client";

import Link from "next/link";
import type { Post } from "../models/post.model";

// Hàm xử lý ảnh đại diện
const getThumbnailPath = (thumbnail: any): string => {
  if (!thumbnail) return "/placeholder.svg?height=400&width=600";
  const path = Array.isArray(thumbnail) ? thumbnail[0] : thumbnail;

  if (
    typeof path === "string" &&
    (path.startsWith("http://") || path.startsWith("https://"))
  ) {
    return path;
  }

  if (typeof path === "string" && path.startsWith("/uploads")) {
    return `${path}`;
  }

  return path || "/placeholder.svg?height=400&width=600";
};

// Danh sách bài viết nhỏ
export const SmallPostList = ({ posts }: { posts: Post[] }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {posts.map((post, index) => {
        const imageUrl = getThumbnailPath(post.thumbnail);
        return (
          <Link
            key={`${post.id}-${index}`}
            href={`/posts/${post.slug}`}
            className="flex gap-4 group border-b pb-4 last:border-0"
          >
            <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-md">
              <img
                src={imageUrl || "/placeholder.svg"}
                alt={post.title}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                crossOrigin="anonymous"
                loading="lazy"
              />
            </div>
            <div>
              <h3 className="font-medium group-hover:text-[#021737] transition-colors line-clamp-2 text-sm">
                {post.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(post.publishedDate).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
