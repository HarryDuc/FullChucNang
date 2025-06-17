import { useState, useCallback } from "react";
import { ClientProduct } from "@/common/models/product.model";
import { Product } from "../../products/models/product.model";
import { FlashSaleService } from "../services/flash-sale.service";

interface UseFlashSaleProductsReturn {
  products: ClientProduct[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: Error | null;
  fetchProducts: (page?: number, limit?: number) => Promise<void>;
  createProduct: (product: Partial<Product>) => Promise<Product>;
  updateProduct: (slug: string, product: Partial<Product>) => Promise<Product>;
  deleteProduct: (slug: string) => Promise<void>;
  getProduct: (slug: string) => Promise<Product>;
}

export const useFlashSaleProducts = (): UseFlashSaleProductsReturn => {
  const [products, setProducts] = useState<ClientProduct[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async (currentPage: number = 1, limit: number = 16) => {
    setLoading(true);
    setError(null);
    try {
      const result = await FlashSaleService.getAll("flash sale", currentPage, limit);
      setProducts(result.data);
      setTotal(result.total);
      setPage(result.page);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Lỗi khi tải danh sách sản phẩm flash sale"));
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (product: Partial<Product>): Promise<Product> => {
    setLoading(true);
    setError(null);
    try {
      const newProduct = await FlashSaleService.create(product);
      await fetchProducts(page); // Refresh danh sách sau khi tạo
      return newProduct;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Lỗi khi tạo sản phẩm flash sale");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [page, fetchProducts]);

  const updateProduct = useCallback(async (slug: string, product: Partial<Product>): Promise<Product> => {
    setLoading(true);
    setError(null);
    try {
      const updatedProduct = await FlashSaleService.update(slug, product);
      await fetchProducts(page); // Refresh danh sách sau khi cập nhật
      return updatedProduct;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Lỗi khi cập nhật sản phẩm flash sale");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [page, fetchProducts]);

  const deleteProduct = useCallback(async (slug: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await FlashSaleService.remove(slug);
      await fetchProducts(page); // Refresh danh sách sau khi xóa
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Lỗi khi xóa sản phẩm flash sale");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [page, fetchProducts]);

  const getProduct = useCallback(async (slug: string): Promise<Product> => {
    setLoading(true);
    setError(null);
    try {
      return await FlashSaleService.getOne(slug);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Lỗi khi lấy thông tin sản phẩm flash sale");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    total,
    page,
    totalPages,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProduct,
  };
};