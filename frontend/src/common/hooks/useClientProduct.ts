import { useState, useEffect } from "react";
import { ClientProduct } from "../models/product.model";
import { ClientProductService } from "../services/client.products.service";

// Hook lấy danh sách sản phẩm
export const useClientProducts = (page: number = 1) => {
  const [products, setProducts] = useState<ClientProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setIsError(null);
      try {
        const response = await ClientProductService.getAll(page);
        setProducts(response.data);
        setTotal(response.total);
        setTotalPages(response.totalPages);
      } catch (error) {
        setIsError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [page]);

  return { products, total, totalPages, isLoading, isError };
};

// Hook lấy danh sách sản phẩm theo danh mục
export const useProductsByCategory = (category: string, page: number = 1) => {
  const [products, setProducts] = useState<ClientProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      setIsLoading(true);
      setIsError(null);
      try {
        const response = await ClientProductService.getByCategory(
          category,
          page
        );
        setProducts(response.data);
        setTotal(response.total);
        setTotalPages(response.totalPages);
      } catch (error) {
        setIsError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductsByCategory();
  }, [category, page]);

  return { products, total, totalPages, isLoading, isError };
};
