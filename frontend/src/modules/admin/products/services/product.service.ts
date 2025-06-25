import { ClientProduct } from "@/common/models/product.model";
import { Product } from "../models/product.model";

import { config } from "@/config/config";
import { API_URL_CLIENT } from "@/config/apiRoutes";

const IMAGE_UPLOAD_API = API_URL_CLIENT + config.ROUTES.IMAGES.UPLOAD;
const PRODUCT_API = API_URL_CLIENT + config.ROUTES.PRODUCTS.BASE;
const CATEGORY_API = API_URL_CLIENT + config.ROUTES.CATEGORIES_PRODUCT.BASE;

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
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
  body: data ? JSON.stringify(data) : undefined,
});

export const ProductService = {
  // Lấy danh sách sản phẩm có phân trang
  getAll: async (
    page: number = 1,
    limit: number = 16
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

  // Lấy thông tin cơ bản của sản phẩm
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

  // Lấy danh sách sản phẩm theo danh mục
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
      // Xử lý hasVariants dựa trên dữ liệu đầu vào
      const hasVariants = !!(product.variants && product.variants.length > 0);
      const productData = {
        ...product,
        hasVariants,
        // Nếu không có biến thể, đảm bảo stock được thiết lập
        stock: hasVariants ? undefined : (product.stock || 0)
      };

      console.log('Creating product with data:', productData);
      const response = await fetch(PRODUCT_API, fetchOptions("POST", productData));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create product error details:', {
          status: response.status,
          statusText: response.statusText,
          responseText: errorText,
          requestData: productData
        });
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || "Lỗi khi tạo sản phẩm");
        } catch (e) {
          console.log(e);
          throw new Error(`Lỗi khi tạo sản phẩm: ${errorText}`);
        }
      }

      return handleResponse(response);
    } catch (error) {
      console.error("Lỗi chi tiết khi tạo sản phẩm:", error);
      throw error;
    }
  },

  // Cập nhật sản phẩm
  update: async (slug: string, product: Partial<Product>): Promise<Product> => {
    try {
      // Xử lý hasVariants dựa trên dữ liệu đầu vào
      const hasVariants = !!(product.variants && product.variants.length > 0);
      const productData = {
        ...product,
        hasVariants,
        // Nếu không có biến thể, đảm bảo stock được thiết lập
        stock: hasVariants ? undefined : (product.stock || 0)
      };

      const response = await fetch(
        `${PRODUCT_API}/${slug}`,
        fetchOptions("PUT", productData)
      );
      return handleResponse(response);
    } catch (error) {
      console.error(`Lỗi khi cập nhật sản phẩm ${slug}:`, error);
      throw error;
    }
  },

  // Xóa sản phẩm
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

  // Upload ảnh
  uploadImage: async (file: File): Promise<{ url: string }> => {
    try {
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
    } catch (error) {
      console.error("Lỗi khi upload ảnh:", error);
      throw error;
    }
  },

  // Lấy danh sách danh mục
  getAllCategories: async () => {
    try {
      const response = await fetch(CATEGORY_API);
      return handleResponse(response);
    } catch (error) {
      console.error("Lỗi khi lấy danh mục sản phẩm:", error);
      throw error;
    }
  },

  // Tìm kiếm sản phẩm
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

  // Cập nhật biến thể sản phẩm
  updateVariants: async (slug: string, variants: Product['variants']): Promise<Product> => {
    try {
      const response = await fetch(
        `${PRODUCT_API}/${slug}/variants`,
        fetchOptions("PUT", { variants, hasVariants: true })
      );
      return handleResponse(response);
    } catch (error) {
      console.error(`Lỗi khi cập nhật biến thể sản phẩm ${slug}:`, error);
      throw error;
    }
  },

  // Cập nhật thuộc tính biến thể sản phẩm
  updateVariantAttributes: async (slug: string, variantAttributes: Product['variantAttributes']): Promise<Product> => {
    try {
      const response = await fetch(
        `${PRODUCT_API}/${slug}/variant-attributes`,
        fetchOptions("PUT", { variantAttributes })
      );
      return handleResponse(response);
    } catch (error) {
      console.error(`Lỗi khi cập nhật thuộc tính biến thể sản phẩm ${slug}:`, error);
      throw error;
    }
  },

  // Cập nhật số lượng tồn kho của sản phẩm
  updateStock: async (slug: string, stock: number): Promise<Product> => {
    try {
      const response = await fetch(
        `${PRODUCT_API}/${slug}/stock`,
        fetchOptions("PUT", { stock })
      );
      return handleResponse(response);
    } catch (error) {
      console.error(`Lỗi khi cập nhật số lượng tồn kho sản phẩm ${slug}:`, error);
      throw error;
    }
  }
};
