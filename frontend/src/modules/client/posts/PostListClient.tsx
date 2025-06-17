"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePosts } from "./hooks/usePosts";
import FeaturedPost from "./components/FeaturedPost";
import SecondaryFeaturedPost from "./components/SecondaryFeaturedPost";
import PostCard from "./components/PostCard";
import FeaturedPostSkeleton from "./components/FeaturedPostSkeleton";
import SecondaryFeaturedPostSkeleton from "./components/SecondaryFeaturedPostSkeleton";
import PostCardSkeleton from "./components/PostCardSkeleton";

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

export default function PostListClient() {
  const { postsQuery } = usePosts();
  const [visiblePosts, setVisiblePosts] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const postsArray = postsQuery.data || [];
  const sortedPosts = [...postsArray].sort(
    (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
  );
  const featuredPost = sortedPosts[0];
  const secondaryFeaturedPost = sortedPosts[1];
  const remainingPosts = sortedPosts.slice(2);
  const postsToShow = remainingPosts.slice(0, visiblePosts);
  const hasMorePosts = remainingPosts.length > visiblePosts;

  // 🔁 Auto-load thêm bài viết
  useEffect(() => {
    if (!hasMorePosts || isLoadingMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setVisiblePosts((prev) => prev + 6);
          setIsLoadingMore(false);
        }, 500);
      }
    }, { threshold: 0.5 });

    const current = loadMoreRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasMorePosts, isLoadingMore]);

  // 🌀 Loading tổng
  if (postsQuery.isLoading) {
    return (
      <div className="lg:col-span-8">
        <FeaturedPostSkeleton />
        <SecondaryFeaturedPostSkeleton />
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Tất cả bài viết</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-8">
      {featuredPost && <FeaturedPost post={featuredPost} getThumbnailPath={getThumbnailPath} />}
      {secondaryFeaturedPost && <SecondaryFeaturedPost post={secondaryFeaturedPost} getThumbnailPath={getThumbnailPath} />}

      <h2 className="text-2xl font-bold mb-6 border-b pb-2">Tất cả bài viết</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {postsToShow.map((post) => (
          <Link key={post.slug} href={`/posts/${post.slug}`}>
            <PostCard post={post} getThumbnailPath={getThumbnailPath} />
          </Link>
        ))}
      </div>

      {hasMorePosts && (
        <div ref={loadMoreRef} className="min-h-[50px] text-center py-8">
          {isLoadingMore && (
            <div className="flex items-center justify-center">
              <div className="h-5 w-5 border-4 border-blue-900 border-r-transparent rounded-full animate-spin" />
              <span className="ml-2 text-sm text-gray-500">Đang tải thêm...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}