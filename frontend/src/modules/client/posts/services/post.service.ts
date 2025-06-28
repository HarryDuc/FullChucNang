import { Post, PostStatus } from "../models/post.model";
import { API_URL_CLIENT } from "@/config/apiRoutes";
import { config } from "@/config/config";
import { CategoryPostTree } from "../models/categories-post.model";

const POST_API = API_URL_CLIENT + config.ROUTES.POSTS.BASE;
const CATEGORY_POST_API = API_URL_CLIENT + config.ROUTES.CATEGORIES_POST.BASE;

// 🔧 Xử lý response từ server
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Lỗi từ máy chủ");
  }
  return response.json();
};

// 🛡️ Sinh header tại runtime, client-only
function getAuthHeaders(): Record<string, string> {
  // Nếu chạy trên server, chỉ trả Content-Type
  if (typeof window === "undefined") {
    return {
      "Content-Type": "application/json",
    };
  }
  // Trình duyệt rồi, thoải mái lấy token
  const token = localStorage.getItem("token") || "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// 📚 Kiểu dữ liệu phân trang
export interface PaginatedPosts {
  data: Post[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export const PostService = {
  /**
   * 🔍 Lấy bài viết có phân trang (chỉ lấy bài đã duyệt và hiển thị)
   */
  getPosts: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedPosts> => {
    try {
      // Đảm bảo page và limit là số hợp lệ
      const validPage = Math.max(1, page);
      const validLimit = Math.max(1, Math.min(100, limit));

      // Chỉ lấy bài viết đã duyệt và đang hiển thị
      const url = `${POST_API}?page=${validPage}&limit=${validLimit}&includeHidden=false&status=${PostStatus.Approved}&sort=-publishedDate`;

      const res = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        cache: 'no-store', // Disable caching to ensure fresh data
      });

      if (!res.ok) {
        throw new Error('Failed to fetch posts');
      }

      const result = await handleResponse(res);

      // Validate response structure
      if (!Array.isArray(result.data)) {
        console.error('Invalid response structure:', result);
        throw new Error('Invalid response structure from server');
      }

      // Lọc để đảm bảo chỉ lấy bài đã duyệt và đang hiển thị
      const filteredData = result.data.filter(
        (post: Post) => post.status === PostStatus.Approved && post.isVisible === true
      );

      return {
        data: filteredData,
        total: result.total || 0,
        currentPage: validPage,
        totalPages: Math.ceil((result.total || 0) / validLimit),
      };
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  },

  /**
   * 🔍 Lấy bài viết theo slug (chỉ lấy bài đã duyệt và hiển thị)
   */
  getPostBySlug: async (slug: string): Promise<Post> => {
    // includeHidden=false để chỉ lấy bài đang hiển thị
    const url = `${POST_API}/${slug}?includeHidden=false`;
    const res = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(res);

    // Kiểm tra nếu bài viết không được duyệt hoặc không hiển thị
    if (data.status !== PostStatus.Approved || data.isVisible !== true) {
      throw new Error("Bài viết không tồn tại hoặc chưa được phê duyệt");
    }

    return data as Post;
  },
};

interface CategoryPostResponse {
  message: string;
  data: CategoryPostTree[];
  total?: number;
}

export const CategoryPostService = {
  findAll: async (): Promise<CategoryPostResponse> => {
    const res = await fetch(CATEGORY_POST_API, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const result = await handleResponse(res);
    return result;
  },

  // Hàm tiện ích để làm phẳng cây danh mục
  flattenCategories: (categories: CategoryPostTree[]): CategoryPostTree[] => {
    return categories.reduce((acc: CategoryPostTree[], category) => {
      acc.push(category);
      if (category.children?.length) {
        acc.push(...CategoryPostService.flattenCategories(category.children));
      }
      return acc;
    }, []);
  }
};

/**
 * 🔍 Tìm kiếm bài viết theo tiêu đề
 */
export const searchPosts = async (
  searchTerm: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedPosts> => {
  try {
    // Đảm bảo page và limit là số hợp lệ
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, Math.min(100, limit));

    // Đường dẫn API với tham số tìm kiếm
    const url = `${POST_API}?page=${validPage}&limit=${validLimit}&search=${encodeURIComponent(searchTerm)}`;

    const res = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: 'no-store', // Disable caching to ensure fresh data
    });

    if (!res.ok) {
      throw new Error('Failed to search posts');
    }

    const result = await handleResponse(res);

    // Validate response structure
    if (!Array.isArray(result.data)) {
      console.error('Invalid response structure:', result);
      throw new Error('Invalid response structure from server');
    }

    return {
      data: result.data,
      total: result.total || 0,
      currentPage: validPage,
      totalPages: Math.ceil((result.total || 0) / validLimit),
    };
  } catch (error) {
    console.error("Error searching posts:", error);
    throw error;
  }
}

// 👇 Xuất thẳng cho hook dùng
export const getPosts = PostService.getPosts;
export const getPostBySlug = PostService.getPostBySlug;
