"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useInfinitePosts } from "./hooks/usePosts";
import FeaturedPost from "./components/FeaturedPost";
import SecondaryFeaturedPost from "./components/SecondaryFeaturedPost";
import PostCard from "./components/PostCard";
import FeaturedPostSkeleton from "./components/FeaturedPostSkeleton";
import SecondaryFeaturedPostSkeleton from "./components/SecondaryFeaturedPostSkeleton";
import PostCardSkeleton from "./components/PostCardSkeleton";
import SidebarCategoryPost from "./components/SidebarCategoryPost";

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
  const POSTS_PER_PAGE = 12;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data: posts,
    total,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePosts(POSTS_PER_PAGE);

  // Xử lý sự kiện khi scroll đến cuối trang
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        rootMargin: "100px", // Kích hoạt trước khi đến cuối 100px
        threshold: 0.1,
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Sắp xếp bài viết theo ngày xuất bản mới nhất và đảm bảo không trùng lặp
  const sortedPosts = posts
    ? [...new Map(posts.map((post) => [post.slug, post])).values()].sort(
        (a, b) =>
          new Date(b.publishedDate).getTime() -
          new Date(a.publishedDate).getTime()
      )
    : [];

  const featuredPost = sortedPosts[0];
  const secondaryFeaturedPost = sortedPosts[1];
  const remainingPosts = sortedPosts.slice(2);

  // 🌀 Loading ban đầu
  if (isLoading) {
    return (
      <div className="lg:col-span-8">
        <FeaturedPostSkeleton />
        <SecondaryFeaturedPostSkeleton />
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">
          Tất cả bài viết
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
          {Array.from({ length: POSTS_PER_PAGE }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lg:col-span-8">
        <div className="text-center py-10">
          <p className="text-red-500">
            Có lỗi xảy ra khi tải bài viết. Vui lòng thử lại sau.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 mt-4">
          {featuredPost && (
            <FeaturedPost
              post={featuredPost}
              getThumbnailPath={getThumbnailPath}
            />
          )}
          {secondaryFeaturedPost && (
            <SecondaryFeaturedPost
              post={secondaryFeaturedPost}
              getThumbnailPath={getThumbnailPath}
            />
          )}

          <h2 className="text-2xl font-bold mb-6 border-b pb-2">
            Tất cả bài viết ({total} bài viết)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
            {remainingPosts.map((post) => (
              <Link key={post.id || post.slug} href={`/posts/${post.slug}`}>
                <PostCard post={post} getThumbnailPath={getThumbnailPath} />
              </Link>
            ))}
          </div>

          {/* Loading indicator và element theo dõi scroll */}
          <div ref={loadMoreRef} className="text-center py-4">
            {isFetchingNextPage && (
              <div className="flex justify-center items-center space-x-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="text-gray-600">
                  Đang tải thêm bài viết... ({sortedPosts.length}/{total})
                </span>
              </div>
            )}
            {!hasNextPage && !isFetchingNextPage && (
              <p className="text-gray-500">
                Đã hiển thị tất cả {total} bài viết
              </p>
            )}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-32">
            <SidebarCategoryPost />
          </div>
        </div>
      </div>
    </div>
  );
}
