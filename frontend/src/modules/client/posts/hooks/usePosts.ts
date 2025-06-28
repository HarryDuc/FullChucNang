import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { CategoryPostService, getPostBySlug, getPosts } from "../services/post.service";
import type { PaginatedPosts } from "../models/post.model";
import { CategoryPostTree } from "../models/categories-post.model";

/** ✨ Hook lấy chi tiết 1 bài viết theo slug (chỉ lấy bài đã duyệt và hiển thị) */
export const usePostBySlug = (slug: string) =>
  useQuery({
    queryKey: ["post", slug],
    queryFn: () => getPostBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (
        error instanceof Error &&
        error.message.includes("không tồn tại hoặc chưa được phê duyệt")
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });

/**
 * 📦 Hook lấy danh sách bài viết có phân trang (chỉ lấy bài đã duyệt và hiển thị)
 */
export const usePaginatedPosts = (page: number = 1, limit: number = 10) =>
  useQuery<PaginatedPosts, Error>({
    queryKey: ["posts", page, limit],
    queryFn: () => getPosts(page, limit),
    staleTime: 1000 * 60 * 5,
  });

/**
 * 📦 Hook lấy tất cả bài viết với infinite scroll
 */
export const useInfinitePosts = (limit: number = 12) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery<PaginatedPosts, Error>({
    queryKey: ["infinite-posts", limit],
    initialPageParam: 1,
    queryFn: async (context) => {
      // context.pageParam is unknown, so cast to number with fallback
      const pageParam = typeof context.pageParam === "number" ? context.pageParam : 1;
      const result = await getPosts(pageParam, limit);
      return {
        ...result,
        currentPage: pageParam,
      };
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.data.length) return undefined;
      const nextPage = (lastPage.currentPage || 0) + 1;
      return nextPage <= Math.ceil(lastPage.total / limit) ? nextPage : undefined;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Tổng hợp tất cả bài viết từ các trang
  const posts =
    data?.pages?.flatMap((page) => (page as PaginatedPosts).data) || [];

  // Lấy tổng số bài viết từ response đầu tiên
  const total = data?.pages?.[0]
    ? (data.pages[0] as PaginatedPosts).total
    : 0;

  return {
    data: posts,
    total,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage: posts.length < total,
    isFetchingNextPage,
  };
};

/**
 * 📦 Hook lấy tất cả bài viết đã duyệt và hiển thị (legacy - giữ lại để tương thích ngược)
 * @deprecated Sử dụng useInfinitePosts thay thế
 */
export const useAllPosts = (limit: number = 12) => {
  const { data, isLoading, error } = usePaginatedPosts(1, limit);

  return {
    data: data?.data || [],
    total: data?.total || 0,
    isLoading,
    error,
  };
};

interface CategoryPostsData {
  categories: CategoryPostTree[];
  flatCategories: CategoryPostTree[];
  total: number;
}

/**
 * 📦 Hook lấy danh mục bài viết (hỗ trợ cả cây và danh sách phẳng)
 */
export const useCategoryPosts = () => {
  const { data, isLoading, isError } = useQuery<CategoryPostsData>({
    queryKey: ["category-posts"],
    queryFn: async () => {
      const result = await CategoryPostService.findAll();
      const flatCategories = CategoryPostService.flattenCategories(result.data);

      return {
        categories: result.data,
        flatCategories,
        total: result.total || result.data.length
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    categories: data?.categories || [],
    flatCategories: data?.flatCategories || [],
    total: data?.total || 0,
    isLoading,
    isError,
  };
};