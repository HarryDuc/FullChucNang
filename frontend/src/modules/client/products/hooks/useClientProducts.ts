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
  getProductsByMainAndSubCategory,
} from "../services/client.product.service";
import { filterProducts } from "../services/filter.service";
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
  page: number,
  filters: Record<string, any> = {}
) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if we have any active filters
        const hasActiveFilters = Object.keys(filters).length > 0;

        let response;
        if (hasActiveFilters) {
          // Use filter endpoint if we have filters
          response = await filterProducts(
            category?.id || category?._id || null,
            filters,
            page
          );
        } else {
          // Use regular endpoints if no filters
          if (!category) {
            response = await getAllProducts(page, controller.signal);
          } else if (category.level === 0) {
            response = await getProductsByMainCategory(
              category.name,
              page,
              controller.signal
            );
          } else {
            response = await getProductsBySubCategory(
              category.name,
              page,
              controller.signal
            );
          }
        }

        setProducts(response.data);
        setTotalPages(response.totalPages);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError("Lỗi khi tải dữ liệu sản phẩm.");
          console.error("Error fetching products:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [category, page, filters]); // Add filters to dependencies

  return { products, loading, error, totalPages };
};

/**
 * Hook to fetch category info by slug.
 * @param slug Slug of the category.
 * @returns { category, loading, error }
 */
export function useCategoryBySlugMainAndSubCategory(slug: string, mainCategory: string, subCategory: string, page: number = 1) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(!!slug);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setProducts([]);
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    getProductsByMainAndSubCategory(mainCategory, subCategory, page)
      .then((data) => {
        if (isMounted) {
          setProducts(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError("Không thể tải thông tin danh mục.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug, mainCategory, subCategory, page]);

  return { products, loading, error };
}
