import { useEffect, useState } from "react";
import { ClientCategoryService } from "../services/client.product.category.service";
import { ClientProductCategory } from "../models/product.category.model";

export const useClientProductCategory = () => {
  const [categories, setCategories] = useState<ClientProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await ClientCategoryService.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error); // Ghi log lỗi
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, isError };
};
