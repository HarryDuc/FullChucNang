import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPosts,
  getPostBySlug,
  createPost,
  updatePost,
  softDeletePost,
  hardDeletePost,
  uploadImage,
  PostService,
} from "../services/post.service";

import { Post, UpdatePostDto, CreatePostDto } from "../models/post.model";

/**
 * 🎯 Hook quản lý tất cả thao tác liên quan đến bài viết:
 * - Lấy danh sách bài viết
 * - Tạo mới
 * - Cập nhật
 * - Xóa mềm / Xóa vĩnh viễn
 * - Upload ảnh bài viết
 * - Lấy danh mục bài viết
 */
export const usePosts = () => {
  const queryClient = useQueryClient();

  // ✅ Lấy danh sách bài viết
  const postsQuery = useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: getPosts,
  });

  // ✅ Tạo bài viết mới
  const createMutation = useMutation({
    mutationFn: (data: CreatePostDto) => createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // ✅ Cập nhật bài viết theo slug
  const updateMutation = useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdatePostDto }) =>
      updatePost(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // ✅ Upload ảnh bài viết
  const uploadImageMutation = useMutation({
    mutationFn: uploadImage,
  });

  // ✅ Xóa mềm bài viết
  const softDeleteMutation = useMutation({
    mutationFn: (slug: string) => softDeletePost(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // ✅ Xóa vĩnh viễn bài viết
  const hardDeleteMutation = useMutation({
    mutationFn: (slug: string) => hardDeletePost(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // ✅ Lấy tất cả danh mục bài viết (category-posts)
  const categoriesQuery = useQuery({
    queryKey: ["category-posts"],
    queryFn: PostService.getAllCategories,
  });

  return {
    postsQuery,
    createMutation,
    updateMutation,
    softDeleteMutation,
    hardDeleteMutation,
    uploadImageMutation,
    categoriesQuery,
  };
};

/**
 * 🔍 Hook lấy chi tiết bài viết theo slug.
 * - enabled: false nếu slug chưa sẵn sàng
 */
export const usePostBySlug = (slug: string) => {
  return useQuery<Post>({
    queryKey: ["post", slug],
    queryFn: () => getPostBySlug(slug),
    enabled: !!slug,
  });
};
