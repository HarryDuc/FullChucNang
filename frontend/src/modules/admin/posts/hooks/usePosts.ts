// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   getPosts,
//   getPostBySlug,
//   createPost,
//   updatePost,
//   softDeletePost,
//   hardDeletePost,
//   uploadImage,
//   PostService,
// } from "../services/post.service";

// import { Post, UpdatePostDto, CreatePostDto } from "../models/post.model";

// /**
//  * 🎯 Hook quản lý tất cả thao tác liên quan đến bài viết:
//  * - Lấy danh sách bài viết
//  * - Tạo mới
//  * - Cập nhật
//  * - Xóa mềm / Xóa vĩnh viễn
//  * - Upload ảnh bài viết
//  * - Lấy danh mục bài viết
//  */
// export const usePosts = () => {
//   const queryClient = useQueryClient();
//   const [page, setPage] = useState(1);
//   const limit = 10;

//   // ✅ Lấy danh sách bài viết

//   const postsQuery = useQuery({
//     queryKey: ["posts", page],
//     queryFn: () => getPosts(page, limit),
//     keepPreviousData: true,
//   });

//   // ✅ Tạo bài viết mới
//   const createMutation = useMutation({
//     mutationFn: (data: CreatePostDto) => createPost(data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["posts"] });
//     },
//   });

//   // ✅ Cập nhật bài viết theo slug
//   const updateMutation = useMutation({
//     mutationFn: ({ slug, data }: { slug: string; data: UpdatePostDto }) =>
//       updatePost(slug, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["posts"] });
//     },
//   });

//   // ✅ Upload ảnh bài viết
//   const uploadImageMutation = useMutation({
//     mutationFn: uploadImage,
//   });

//   // ✅ Xóa mềm bài viết
//   const softDeleteMutation = useMutation({
//     mutationFn: (slug: string) => softDeletePost(slug),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["posts"] });
//     },
//   });

//   // ✅ Xóa vĩnh viễn bài viết
//   const hardDeleteMutation = useMutation({
//     mutationFn: (slug: string) => hardDeletePost(slug),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["posts"] });
//     },
//   });

//   // ✅ Lấy tất cả danh mục bài viết (category-posts)
//   const categoriesQuery = useQuery({
//     queryKey: ["category-posts"],
//     queryFn: PostService.getAllCategories,
//   });

//   return {
//     postsQuery,
//     createMutation,
//     updateMutation,
//     softDeleteMutation,
//     hardDeleteMutation,
//     uploadImageMutation,
//     categoriesQuery,
//     page,
//     setPage,
//     limit,
//   };
// };

// /**
//  * 🔍 Hook lấy chi tiết bài viết theo slug.
//  * - enabled: false nếu slug chưa sẵn sàng
//  */
// export const usePostBySlug = (slug: string) => {
//   return useQuery<Post>({
//     queryKey: ["post", slug],
//     queryFn: () => getPostBySlug(slug),
//     enabled: !!slug,
//   });
// };

import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  getPosts,
  searchPosts,
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

// ✅ Xác định kiểu dữ liệu trả về
type GetPostsResponse = {
  data: Post[];
  total: number;
};

export const usePosts = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 10;

  // Query lấy danh sách hoặc tìm kiếm
  const postsQuery = useQuery({
    queryKey: ["posts", page, limit, searchTerm],
    queryFn: () =>
      searchTerm
        ? searchPosts(searchTerm, page, limit)
        : getPosts(page, limit),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  } as UseQueryOptions<GetPostsResponse, Error, GetPostsResponse, [string, number, number, string]>);

  // ✅ Tạo bài viết mới
  const createMutation = useMutation({
    mutationFn: (data: CreatePostDto) => createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // ✅ Cập nhật bài viết
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

  // ✅ Xóa mềm
  const softDeleteMutation = useMutation({
    mutationFn: (slug: string) => softDeletePost(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // ✅ Xóa vĩnh viễn
  const hardDeleteMutation = useMutation({
    mutationFn: (slug: string) => hardDeletePost(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // ✅ Lấy danh mục bài viết
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
    page,
    setPage,
    limit,
    searchTerm,
    setSearchTerm,
  };
};

/**
 * 🔍 Hook lấy chi tiết bài viết theo slug.
 */
export const usePostBySlug = (slug: string) =>
  useQuery<Post>({
    queryKey: ["post", slug],
    queryFn: () => getPostBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
