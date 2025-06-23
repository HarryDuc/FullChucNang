import { Redirect, RedirectPagination } from "../models/redirect.model";

const BASE_API = process.env.NEXT_PUBLIC_API_URL!;
const REDIRECT_API = `${BASE_API}/redirects`;

// Hàm xử lý phản hồi từ API
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      errorData
    });
    throw new Error(errorData?.message || "Lỗi khi xử lý yêu cầu");
  }
  return response.json();
};

// Hàm tạo options chung cho fetch
const fetchOptions = (method: string, data?: any) => ({
  method,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  },
  body: data ? JSON.stringify(data) : undefined,
});

export const RedirectService = {
  // Lấy danh sách redirects có phân trang và bộ lọc
  getAll: async (
    page: number = 1,
    limit: number = 10,
    type?: string,
    isActive?: boolean,
    path?: string,
    statusCode?: string
  ): Promise<RedirectPagination> => {
    try {
      let url = `${REDIRECT_API}?page=${page}&limit=${limit}`;
      
      if (type) url += `&type=${encodeURIComponent(type)}`;
      if (isActive !== undefined) url += `&isActive=${isActive}`;
      if (path) url += `&path=${encodeURIComponent(path)}`;
      if (statusCode) url += `&statusCode=${statusCode}`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách redirects:", error);
      throw error;
    }
  },

  // Lấy chi tiết redirect theo ID
  getOne: async (id: string): Promise<Redirect> => {
    try {
      const response = await fetch(`${REDIRECT_API}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error(`Lỗi khi lấy redirect với ID ${id}:`, error);
      throw error;
    }
  },

  // Tạo redirect mới
  create: async (redirect: Partial<Redirect>): Promise<Redirect> => {
    try {
      const response = await fetch(REDIRECT_API, fetchOptions("POST", redirect));
      return handleResponse(response);
    } catch (error) {
      console.error("Lỗi khi tạo redirect:", error);
      throw error;
    }
  },

  // Tạo nhiều redirect cùng lúc
  createBulk: async (redirects: Partial<Redirect>[]): Promise<{ created: number, updated: number }> => {
    try {
      const response = await fetch(`${REDIRECT_API}/bulk`, fetchOptions("POST", redirects));
      return handleResponse(response);
    } catch (error) {
      console.error("Lỗi khi tạo redirects hàng loạt:", error);
      throw error;
    }
  },

  // Cập nhật redirect
  update: async (id: string, redirect: Partial<Redirect>): Promise<Redirect> => {
    try {
      const response = await fetch(
        `${REDIRECT_API}/${id}`,
        fetchOptions("PATCH", redirect)
      );
      
      return handleResponse(response);
    } catch (error) {
      console.error(`Lỗi khi cập nhật redirect ${id}:`, error);
      throw error;
    }
  },

  // Xóa redirect
  remove: async (id: string): Promise<void> => {
    try {
      const response = await fetch(
        `${REDIRECT_API}/${id}`,
        fetchOptions("DELETE")
      );
      
      await handleResponse(response);
    } catch (error) {
      console.error(`Lỗi khi xóa redirect ${id}:`, error);
      throw error;
    }
  },

  // Kiểm tra redirect
  checkRedirect: async (path: string): Promise<Redirect | null> => {
    try {
      const response = await fetch(`${REDIRECT_API}/check?path=${encodeURIComponent(path)}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      
      const result = await handleResponse(response);
      return result?._id ? result : null;
    } catch (error) {
      console.error(`Lỗi khi kiểm tra redirect path ${path}:`, error);
      return null;
    }
  }
}; 