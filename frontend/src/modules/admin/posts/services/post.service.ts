import { Post } from "../models/post.model";
import { Category } from "../models/post.model";

const BASE_API = process.env.NEXT_PUBLIC_API_URL!;
const POST_API = `${BASE_API}/postapi`;
const IMAGE_UPLOAD_API = `${BASE_API}/images/upload`;
const CATEGORY_POST_API = `${BASE_API}/categories-postapi`;

// 🔧 Hàm xử lý phản hồi trả về từ API
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Lỗi từ máy chủ");
  }
  return response.json();
};

// 🔧 Hàm tạo options fetch chung (data giờ phải là object)
const fetchOptions = (method: string, data?: unknown): RequestInit => ({
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
   */
  create: async (post: Partial<Post>): Promise<Post> => {
    const response = await fetch(POST_API, fetchOptions("POST", post));
    return handleResponse(response);
  },

  /**
   * 📋 Lấy danh sách bài viết có phân trang
   */
  getAll: async (
    page = 1,
    limit = 10
  ): Promise<{ data: Post[]; total: number }> => {
    const response = await fetch(`${POST_API}?page=${page}&limit=${limit}`);
    return handleResponse(response);
  },

  /**
   * 🔍 Chi tiết 1 bài theo slug
   */
  getOne: async (slug: string): Promise<Post> => {
    const response = await fetch(`${POST_API}/${slug}`);
    return handleResponse(response);
  },

  /**
   * ✏️ Cập nhật bài viết
   */
  update: async (slug: string, post: Partial<Post>): Promise<Post> => {
    const response = await fetch(
      `${POST_API}/${slug}`,
      fetchOptions("PATCH", post)
    );
    return handleResponse(response);
  },

  /**
   * 🗑️ Xóa mềm
   */
  softDelete: async (slug: string): Promise<void> => {
    const response = await fetch(`${POST_API}/${slug}`, fetchOptions("DELETE"));
    return handleResponse(response);
  },

  /**
   * ❌ Xóa vĩnh viễn
   */
  hardDelete: async (slug: string): Promise<void> => {
    const response = await fetch(
      `${POST_API}/${slug}/force`,
      fetchOptions("DELETE")
    );
    return handleResponse(response);
  },

  /**
   * 🖼️ Upload ảnh (cover, nội dung…)
   */
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(IMAGE_UPLOAD_API, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const result = await handleResponse(response);
    if (!result.imageUrl) throw new Error("Không tìm thấy URL ảnh");
    return { url: result.imageUrl };
  },

  /**
   * 📂 Lấy full cây category-post (pagin vòng while)
   */
  getAllCategories: async (): Promise<{ data: Category[] }> => {
    const allCategories: Category[] = [];
    let page = 1;
    const limit = 10;

    while (true) {
      const response = await fetch(
        `${CATEGORY_POST_API}?page=${page}&limit=${limit}`
      );
      const result = await handleResponse(response);

      if (!Array.isArray(result.data)) break;
      allCategories.push(...result.data);
      if (result.data.length < limit) break;
      page++;
    }

    return { data: allCategories };
  },

  /**
   * 🔍 Tìm kiếm bài viết theo tên (có phân trang)
   */
  search: async (
    searchTerm: string,
    page = 1,
    limit = 10
  ): Promise<{ data: Post[]; total: number }> => {
    const response = await fetch(
      `${POST_API}?page=${page}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`
    );
    return handleResponse(response);
  },
};

// 👇 Export từng hàm để hook dùng
export const createPost = PostService.create;
export const getPosts = PostService.getAll;
export const getPostBySlug = PostService.getOne;
export const updatePost = PostService.update;
export const softDeletePost = PostService.softDelete;
export const hardDeletePost = PostService.hardDelete;
export const uploadImage = PostService.uploadImage;
export const getAllCategories = PostService.getAllCategories;
export const searchPosts = PostService.search;
