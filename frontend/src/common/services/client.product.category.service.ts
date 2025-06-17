const CATEGORY_API = `${process.env.NEXT_PUBLIC_API_URL}/categories-product`;

// Hàm xử lý phản hồi từ API
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Lỗi khi xử lý yêu cầu");
  }
  return response.json();
};

export const ClientCategoryService = {
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
};
