import { useState, useEffect, useCallback } from "react";
import { Product, VariantAttribute, ProductVariant } from "../models/product.model";
import { ProductService } from "../services/product.service";
import { useImages } from "@/common/hooks/useImages";

// Định nghĩa kiểu cho danh mục
interface Category {
  _id: string;
  name: string;
  slug: string;
  parentCategory: string | null;
  subCategories: string[];
  description: string;
  level: number;
  isActive: boolean;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [productDetail, setProductDetail] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchTotalPages, setSearchTotalPages] = useState<number>(1);
  const [searchCurrentPage, setSearchCurrentPage] = useState<number>(1);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Sử dụng hook useImages
  const { uploadImage: uploadImageToServer } = useImages();

  // 📌 Lấy danh sách sản phẩm (có phân trang)
  const fetchProducts = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const data = await ProductService.getAll(page);
      setProducts(data.data);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 📌 Chuyển sang trang kế tiếp
  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      fetchProducts(currentPage + 1);
    }
  }, [currentPage, totalPages, fetchProducts]);

  // 📌 Quay về trang trước
  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      fetchProducts(currentPage - 1);
    }
  }, [currentPage, fetchProducts]);

  // 📌 Lấy danh sách danh mục sản phẩm
  const fetchCategories = useCallback(async () => {
    try {
      const data = await ProductService.getAllCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  // 📌 Lấy chi tiết sản phẩm theo slug
  const getProductBySlug = useCallback(async (slug: string) => {
    setIsLoading(true);
    try {
      const data = await ProductService.getOne(slug);
      setProductDetail(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 📌 Tạo sản phẩm mới
  const createProduct = useCallback(
    async (product: Partial<Product>) => {
      try {
        console.log('Creating product in hook with data:', product);
        await ProductService.create(product);
        await fetchProducts();
      } catch (err: any) {
        console.error('Error in createProduct hook:', err);
        if (err.response) {
          const errorText = await err.response.text();
          console.error('Error response in hook:', errorText);
        }
        setError(err.message);
        throw err; // Re-throw to handle in the form
      }
    },
    [fetchProducts]
  );

  // 📌 Cập nhật sản phẩm
  const updateProduct = useCallback(
    async (slug: string, product: Partial<Product>) => {
      try {
        await ProductService.update(slug, product);
        await fetchProducts();
      } catch (err: any) {
        setError(err.message);
      }
    },
    [fetchProducts]
  );

  // 📌 Cập nhật biến thể sản phẩm
  const updateProductVariants = useCallback(
    async (slug: string, variants: ProductVariant[]) => {
      try {
        await ProductService.updateVariants(slug, variants);
        await getProductBySlug(slug); // Refresh product detail
      } catch (err: any) {
        setError(err.message);
      }
    },
    [getProductBySlug]
  );

  // 📌 Cập nhật thuộc tính biến thể sản phẩm
  const updateProductVariantAttributes = useCallback(
    async (slug: string, variantAttributes: VariantAttribute[]) => {
      try {
        await ProductService.updateVariantAttributes(slug, variantAttributes);
        await getProductBySlug(slug); // Refresh product detail
      } catch (err: any) {
        setError(err.message);
      }
    },
    [getProductBySlug]
  );

  // 📌 Xóa sản phẩm
  const deleteProduct = useCallback(
    async (slug: string) => {
      try {
        await ProductService.remove(slug);
        await fetchProducts();
      } catch (err: any) {
        setError(err.message);
      }
    },
    [fetchProducts]
  );

  // 📌 Upload ảnh sản phẩm - Sử dụng useImages hook
  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      try {
        const result = await uploadImageToServer(file);
        if (!result) throw new Error('Failed to upload image');
        return result.imageUrl;
      } catch (err: any) {
        setError(err.message);
        return null;
      }
    },
    [uploadImageToServer]
  );

  // 📌 Gọi API khi component mount
  useEffect(() => {
    fetchCategories();
    fetchProducts(1);
  }, [fetchCategories, fetchProducts]);

  // 📌 Tìm kiếm sản phẩm theo tên
  const searchProducts = useCallback(
    async (searchTerm: string, page: number = 1) => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        setSearchTotalPages(0);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const result = await ProductService.searchByName(searchTerm, page);
        setSearchResults(result.data);
        setSearchTotalPages(result.totalPages);
        setSearchCurrentPage(page);
      } catch (err: any) {
        setError(err.message);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  return {
    products,
    categories,
    productDetail,
    isLoading,
    error,
    currentPage,
    totalPages,
    searchResults,
    searchTotalPages,
    searchCurrentPage,
    isSearching,
    fetchProducts,
    goToNextPage,
    goToPrevPage,
    createProduct,
    updateProduct,
    updateProductVariants,
    updateProductVariantAttributes,
    deleteProduct,
    uploadImage,
    getProductBySlug,
    searchProducts,
  };
};
