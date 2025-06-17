"use client";

import { useState, useEffect } from "react";
import {
  getMainCategories,
  getSubCategoriesByParentId,
  getAllProducts,
  getProductsByMainCategory,
  getProductsBySubCategory,
  getCategoryBySlug,
  Category,
  Product,
} from "../services/client.product.service";
import {
  getCachedMainCategories,
  setCachedMainCategories,
  getCachedSubCategories,
  setCachedSubCategories,
} from "../../../../../utils/categoryCache";

export const useMainCategories = () => {
  const [categories, setCategories] = useState<Category[]>(
    getCachedMainCategories() || []
  );
  const [loading, setLoading] = useState(!getCachedMainCategories());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getCachedMainCategories()) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      try {
        const data = await getMainCategories(signal);
        setCachedMainCategories(data);
        setCategories(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message || "Không thể tải danh mục!");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  return { categories, loading, error };
};

export const useSubCategories = (parentId: string) => {
  const [subCategories, setSubCategories] = useState<Category[]>(
    getCachedSubCategories(parentId) || []
  );
  const [loading, setLoading] = useState(!getCachedSubCategories(parentId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!parentId || getCachedSubCategories(parentId)) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      try {
        const data = await getSubCategoriesByParentId(parentId, signal);
        setCachedSubCategories(parentId, data);
        setSubCategories(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message || "Không thể tải danh mục con!");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [parentId]);

  return { subCategories, loading, error };
};

export const useAllProducts = (page: number = 1) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getAllProducts(page, signal);
        setProducts(response.data);
        setTotalPages(response.totalPages);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message || "Không thể tải danh sách sản phẩm!");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [page]);

  return { products, loading, error, totalPages };
};

export const useProductsByMainCategory = (
  mainCategory: string | null,
  page: number = 1
) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      if (!mainCategory) {
        setProducts([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await getProductsByMainCategory(
          mainCategory,
          page,
          controller.signal
        );

        setProducts((prev) =>
          page === 1 ? response.data : [...prev, ...response.data]
        );
        setTotalPages(response.totalPages);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError("Lỗi khi tải dữ liệu.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [mainCategory, page]);

  return { products, loading: isLoading, error, totalPages };
};

export const useProductsBySubCategory = (
  subCategory: string | null,
  page: number = 1
) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subCategory) return;

    const controller = new AbortController();
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProductsBySubCategory(subCategory, page);
        setProducts(response.data);
        setTotalPages(response.totalPages);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(
            err.message || "Không thể tải danh sách sản phẩm theo danh mục phụ!"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [subCategory, page]);

  return { products, loading, error, totalPages };
};

export const useCategoryBySlug = (slug: string | null) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchCategory = async () => {
      try {
        setLoading(true);
        const data = await getCategoryBySlug(slug, signal);
        setCategory(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message || "Không thể tải thông tin danh mục!");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
    return () => controller.abort();
  }, [slug]);

  return { category, loading, error };
};

export const useProductsByCategory = (
  category: Category | null,
  page: number
) => {
  const allHook = useAllProducts(page);
  const mainHook = useProductsByMainCategory(category?.name || null, page);
  const subHook = useProductsBySubCategory(category?.name || null, page);

  if (!category) return allHook;
  if (category.level === 0) return mainHook;
  return subHook;
};
