"use client";
import Link from "next/link";
import type { FC } from "react";

interface RecentPost {
  id: string | number;
  slug: string;
  title: string;
  publishedDate: string;
  thumbnail?: any;
}

interface RecentPostsListProps {
  posts: RecentPost[];
  currentSlug: string;
  getThumbnailPath: (thumbnail: any) => string;
}

const RecentPostsList: FC<RecentPostsListProps> = ({ posts, currentSlug, getThumbnailPath }) => (
  <div className="bg-gray-50 p-6 rounded-xl mt-5">
    <h3 className="text-xl font-bold mb-4">Bài Viết Mới</h3>
    <div className="space-y-4">
      {posts.map((recentPost, index) => (
        <Link
          key={`${recentPost.id}-${index}`}
          href={`/posts/${recentPost.slug}`}
          className={`flex gap-3 group ${recentPost.slug === currentSlug ? "pointer-events-none opacity-60" : ""}`}
          tabIndex={recentPost.slug === currentSlug ? -1 : 0}
          aria-label={recentPost.title}
        >
          <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-md">
            <img
              src={getThumbnailPath(recentPost.thumbnail) || "/placeholder.svg"}
              alt={recentPost.title}
              className="object-cover w-full h-full"
              crossOrigin="anonymous"
            />
          </div>
          <div>
            <h4 className="font-medium group-hover:text-blue-600 transition-colors line-clamp-2">
              {recentPost.title}
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(recentPost.publishedDate).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

export default RecentPostsList;