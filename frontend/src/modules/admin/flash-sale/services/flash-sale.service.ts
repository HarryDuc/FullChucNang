import { ClientProduct } from "@/common/models/product.model";
import { Product } from "../../products/models/product.model";

import { config } from "@/config/config";
import { API_URL_CLIENT } from "@/config/apiRoutes";

const PRODUCT_API = API_URL_CLIENT + config.ROUTES.PRODUCTS.BASE;

// Hàm xử lý phản hồi từ API
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Lỗi khi xử lý yêu cầu");
  }
  return response.json();
};

// Hàm tạo options cho các request
const fetchOptions = (
  method: string,
  data?: any
): RequestInit => ({
  method,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
  },
  body: data ? JSON.stringify(data) : undefined,
});

export const FlashSaleService = {
  // Lấy danh sách sản phẩm flash sale (có phân trang)
  getAll: async (
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
      console.error("Lỗi khi lấy danh sách sản phẩm flash sale:", error);
      return { data: [], total: 0, page, totalPages: 0 };
    }
  },

  // Lấy chi tiết sản phẩm flash sale theo slug
  getOne: async (slug: string): Promise<Product> => {
    try {
      const response = await fetch(`${PRODUCT_API}/${slug}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Lỗi khi lấy sản phẩm với slug ${slug}:`, error);
      throw error;
    }
  },

  // Tạo sản phẩm flash sale mới
  create: async (product: Partial<Product>): Promise<Product> => {
    try {
      // Đảm bảo sản phẩm được tạo thuộc danh mục flash sale
      const currentMainCategories = (product.category?.main || "").split(",").map(cat => cat.trim());
      const newMainCategories = [...new Set([...currentMainCategories, "Flash Sale"])];

      const flashSaleProduct = {
        ...product,
        category: {
          ...product.category,
          main: newMainCategories.join(", ")
        }
      };

      const response = await fetch(PRODUCT_API, fetchOptions("POST", flashSaleProduct));
      return handleResponse(response);
    } catch (error) {
      console.error("Lỗi khi tạo sản phẩm flash sale:", error);
      throw error;
    }
  },

  // Cập nhật sản phẩm flash sale theo slug
  update: async (slug: string, product: Partial<Product>): Promise<Product> => {
    try {
      // Lấy thông tin sản phẩm hiện tại
      const currentProduct = await FlashSaleService.getOne(slug);

      // Thêm Flash Sale vào danh mục chính nếu chưa có
      const currentMainCategories = (currentProduct.category?.main || "").split(",").map(cat => cat.trim());
      const newMainCategories = [...new Set([...currentMainCategories, "Flash Sale"])];

      const flashSaleProduct = {
        ...product,
        category: {
          ...product.category,
          main: newMainCategories.join(", ")
        }
      };

      const response = await fetch(
        `${PRODUCT_API}/${slug}`,
        fetchOptions("PUT", flashSaleProduct)
      );
      return handleResponse(response);
    } catch (error) {
      console.error(`Lỗi khi cập nhật sản phẩm flash sale ${slug}:`, error);
      throw error;
    }
  },

  // Xóa sản phẩm khỏi flash sale (chỉ xóa danh mục Flash Sale)
  remove: async (slug: string): Promise<void> => {
    try {
      // Lấy thông tin sản phẩm hiện tại
      const currentProduct = await FlashSaleService.getOne(slug);

      // Xóa "Flash Sale" khỏi danh mục chính
      const mainCategories = (currentProduct.category?.main || "")
        .split(",")
        .map(cat => cat.trim())
        .filter(cat => cat !== "Flash Sale")
        .join(", ");

      // Cập nhật sản phẩm với danh mục đã cập nhật
      const updatedProduct = {
        ...currentProduct,
        category: {
          ...currentProduct.category,
          main: mainCategories,
        },
        // Xóa giá khuyến mãi khi xóa khỏi flash sale
        discountPrice: undefined
      };

      const response = await fetch(
        `${PRODUCT_API}/${slug}`,
        fetchOptions("PUT", updatedProduct)
      );
      await handleResponse(response);
    } catch (error) {
      console.error(`Lỗi khi xóa sản phẩm khỏi flash sale ${slug}:`, error);
      throw error;
    }
  },

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