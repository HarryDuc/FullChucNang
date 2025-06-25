import { ClientProduct } from "@/common/models/product.model";
import { Product } from "../models/product.model";
import { config } from "@/config/config";
import { API_URL_CLIENT } from "@/config/apiRoutes";

const IMAGE_UPLOAD_API = API_URL_CLIENT + config.ROUTES.IMAGES.UPLOAD;
const PRODUCT_API = API_URL_CLIENT + config.ROUTES.PRODUCTS.BASE;
const CATEGORY_API = API_URL_CLIENT + config.ROUTES.CATEGORIES_PRODUCT.BASE;
const VARIANT_API = API_URL_CLIENT + config.ROUTES.VARIANTS.BASE;

// Hàm xử lý phản hồi từ API
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Lỗi khi xử lý yêu cầu");
  }
  return response.json();
};

// Hàm tạo options chung cho fetch
const fetchOptions = (method: string, data?: any) => ({
  method,
  headers: {
    "Content-Type": "application/json",
    // Nếu API yêu cầu xác thực, bổ sung Authorization header
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
  body: data ? JSON.stringify(data) : undefined,
});

export const ProductService = {
  getAll: async (
    page: number = 1,
    limit: number = 16 // 🔥 Thêm tham số limit
  ): Promise<{
    data: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    try {
      const response = await fetch(
        `${PRODUCT_API}?page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
      }

      const result = await handleResponse(response);

      if (!result || !result.data) {
        throw new Error("Dữ liệu trả về không hợp lệ");
      }

      return result;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm có phân trang:", error);
      throw error;
    }
  },

  // lấy danh sách sản phẩm cơ bản
  getBasicInfo: async (
    page: number = 1,
    limit: number = 16
  ): Promise<{
    data: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const response = await fetch(
      `${PRODUCT_API}/basic-info?page=${page}&limit=${limit}`
    );
    return handleResponse(response);
  },

  // Lấy danh sách sản phẩm theo danh mục chính (có phân trang)
  getByCategory: async (
    mainCategory: string,
    page: number = 1,
    limit: number = 16
  ): Promise<{
    data: ClientProduct[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    try {
      const encodedCategory = encodeURIComponent(mainCategory);
      const response = await fetch(
        `${PRODUCT_API}/bycategory/${encodedCategory}?page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
      }

      return handleResponse(response);
    } catch (error) {
      console.error(
        `Lỗi khi lấy danh sách sản phẩm theo danh mục "${mainCategory}":`,
        error
      );
      // Trả về kết quả trống nếu lỗi để tránh làm hỏng UI
      return { data: [], total: 0, page, totalPages: 0 };
    }
  },

  // Lấy chi tiết sản phẩm theo slug
  getOne: async (slug: string): Promise<Product> => {
    try {
      const response = await fetch(`${PRODUCT_API}/${slug}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Lỗi khi lấy sản phẩm với slug ${slug}:`, error);
      throw error;
    }
  },

  // Tạo sản phẩm mới
  create: async (product: Partial<Product>): Promise<Product> => {
    try {
      const response = await fetch(PRODUCT_API, fetchOptions("POST", product));
      return handleResponse(response);
    } catch (error) {
      console.error("Lỗi khi tạo sản phẩm:", error);
      throw error;
    }
  },

  // Cập nhật sản phẩm theo slug
  update: async (slug: string, product: Partial<Product>): Promise<Product> => {
    try {
      const response = await fetch(
        `${PRODUCT_API}/${slug}`,
        fetchOptions("PUT", product)
      );
      return handleResponse(response);
    } catch (error) {
      console.error(`Lỗi khi cập nhật sản phẩm ${slug}:`, error);
      throw error;
    }
  },

  // Xóa sản phẩm theo slug
  remove: async (slug: string): Promise<void> => {
    try {
      const response = await fetch(
        `${PRODUCT_API}/${slug}`,
        fetchOptions("DELETE")
      );
      await handleResponse(response);
    } catch (error) {
      console.error(`Lỗi khi xóa sản phẩm ${slug}:`, error);
      throw error;
    }
  },

  // Upload ảnh sản phẩm
  uploadImage: async (file: File): Promise<{ url: string }> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(IMAGE_UPLOAD_API, {
        method: "POST",
        body: formData,
      });

      const result = await handleResponse(response);
      if (!result.imageUrl) throw new Error("Không tìm thấy URL ảnh");

      return { url: result.imageUrl };
    } catch (error) {
      console.error("Lỗi khi upload ảnh:", error);
      throw error;
    }
  },

  // Lấy danh sách danh mục sản phẩm
  getAllCategories: async () => {
    try {
      const response = await fetch(CATEGORY_API);
      return handleResponse(response);
    } catch (error) {
      console.error("Lỗi khi lấy danh mục sản phẩm:", error);
      throw error;
    }
  },

  // Lấy danh sách biến thể sản phẩm
  getAllVariants: async () => {
    try {
      const response = await fetch(VARIANT_API);
      return handleResponse(response);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách biến thể:", error);
      throw error;
    }
  },

  // Add this method to the ProductService object

  // Tìm kiếm sản phẩm theo tên
  searchByName: async (
    searchTerm: string,
    page: number = 1,
    limit: number = 16
  ): Promise<{
    data: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    try {
      const encodedSearchTerm = encodeURIComponent(searchTerm);
      const response = await fetch(
        `${PRODUCT_API}/search?q=${encodedSearchTerm}&page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
      }

      const result = await handleResponse(response);

      if (!result || !result.data) {
        throw new Error("Dữ liệu trả về không hợp lệ");
      }

      return result;
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sản phẩm:", error);
      throw error;
    }
  },
};
