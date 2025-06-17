// 📁 src/modules/posts/services/post.service.ts

import { Post } from "../models/post.model";

const BASE_API = process.env.NEXT_PUBLIC_API_URL!;
const POST_API = `${BASE_API}/postsapi`;
const IMAGE_UPLOAD_API = `${BASE_API}/images/upload`;
const CATEGORY_POST_API = `${BASE_API}/category-postsapi`;

// 🔧 Hàm xử lý phản hồi trả về từ API
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Lỗi từ máy chủ");
  }
  return response.json();
};

// 🔧 Hàm tạo options fetch chung
const fetchOptions = (method: string, data?: any) => ({
  method,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
  body: data ? JSON.stringify(data) : undefined,
});

// 📦 Service quản lý bài viết
export const PostService = {
  /**
   * 📤 Tạo bài viết mới
   * @param post Dữ liệu bài viết (CreatePostDto)
   * @returns Bài viết đã tạo
   */
  create: async (post: Partial<Post>): Promise<Post> => {
    const response = await fetch(POST_API, fetchOptions("POST", post));
    return handleResponse(response);
  },

  /**
   * 📋 Lấy danh sách tất cả bài viết chưa bị xóa mềm
   * @returns Mảng bài viết
   */
  getAll: async (): Promise<Post[]> => {
    const response = await fetch(POST_API);
    return handleResponse(response);
  },

  /**
   * 🔍 Lấy chi tiết một bài viết theo slug
   * @param slug Slug bài viết
   * @returns Bài viết tương ứng
   */
  getOne: async (slug: string): Promise<Post> => {
    const response = await fetch(`${POST_API}/${slug}`);
    return handleResponse(response);
  },

  /**
   * ✏️ Cập nhật bài viết theo slug
   * @param slug Slug bài viết
   * @param post Dữ liệu cập nhật (UpdatePostDto)
   * @returns Bài viết đã cập nhật
   */
  update: async (slug: string, post: Partial<Post>): Promise<Post> => {
    const response = await fetch(
      `${POST_API}/${slug}`,
      fetchOptions("PATCH", post)
    );
    return handleResponse(response);
  },

  /**
   * 🗑️ Xóa mềm bài viết theo slug
   * @param slug Slug bài viết
   */
  softDelete: async (slug: string): Promise<void> => {
    const response = await fetch(`${POST_API}/${slug}`, fetchOptions("DELETE"));
    return handleResponse(response);
  },

  /**
   * ❌ Xóa vĩnh viễn bài viết khỏi hệ thống
   * @param slug Slug bài viết
   */
  hardDelete: async (slug: string): Promise<void> => {
    const response = await fetch(
      `${POST_API}/${slug}/force`,
      fetchOptions("DELETE")
    );
    return handleResponse(response);
  },

  /**
   * 🖼️ Upload ảnh bài viết (cover, nội dung, etc.)
   * @param file File ảnh cần upload
   * @returns URL ảnh đã upload (relative path)
   */
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(IMAGE_UPLOAD_API, {
      method: "POST",
      body: formData,
    });

    const result = await handleResponse(response);
    if (!result.imageUrl) throw new Error("Không tìm thấy URL ảnh");

    return { url: result.imageUrl };
  },

  // Lấy danh sách danh mục sản phẩm
  getAllCategories: async () => {
    const allCategories: any[] = [];
    let page = 1;
    const limit = 10; // sử dụng đúng limit mặc định của backend

    while (true) {
      const response = await fetch(
        `${CATEGORY_POST_API}?page=${page}&limit=${limit}`
      );
      const result = await handleResponse(response);

      if (!result?.data || !Array.isArray(result.data)) break;

      allCategories.push(...result.data);

      // Nếu số lượng trả về ít hơn limit thì đã hết dữ liệu
      if (result.data.length < limit) break;

      page++;
    }

    return {
      data: allCategories,
    };
  },
};

// 👇 Export từng hàm để các hook có thể sử dụng trực tiếp
export const createPost = PostService.create;
export const getPosts = PostService.getAll;
export const getPostBySlug = PostService.getOne;
export const updatePost = PostService.update;
export const softDeletePost = PostService.softDelete;
export const hardDeletePost = PostService.hardDelete;
export const uploadImage = PostService.uploadImage;
