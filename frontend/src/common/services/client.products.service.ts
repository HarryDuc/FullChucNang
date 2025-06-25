import { ClientProduct } from "../models/product.model";
import { API_URL_CLIENT } from "@/config/apiRoutes";
import { config } from "@/config/config";

const PRODUCT_API = API_URL_CLIENT + config.ROUTES.PRODUCTS.BASE;

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Lỗi khi xử lý yêu cầu");
  }
  return response.json();
};

export const ClientProductService = {
  // Lấy danh sách sản phẩm (có phân trang)
  getAll: async (
    page: number = 1
  ): Promise<{
    data: ClientProduct[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    try {
      const response = await fetch(`${PRODUCT_API}?page=${page}`);
      return handleResponse(response);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      throw error;
    }
  },

  // Lấy danh sách sản phẩm theo danh mục chính (có phân trang)
  getByCategory: async (
    mainCategory: string,
    page: number = 1
  ): Promise<{
    data: ClientProduct[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    try {
      const encodedCategory = encodeURIComponent(mainCategory);
      const response = await fetch(
        `${PRODUCT_API}/bycategory/${encodedCategory}?page=${page}`
      );
      return handleResponse(response);
    } catch (error) {
      console.error(
        `Lỗi khi lấy danh sách sản phẩm theo danh mục "${mainCategory}":`,
        error
      );
      throw error;
    }
  },
};
