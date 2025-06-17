"use client";

import { useEffect, useState, useCallback } from "react";
import { CategoriesProduct } from "../types/categories-product.types";
import { getCategoriesProduct } from "../services/categories-product.service";

export const useCategoriesProduct = () => {
  const [categoriesProduct, setCategoriesProduct] = useState<
    CategoriesProduct[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const data = await getCategoriesProduct();
    setCategoriesProduct(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { categoriesProduct, loading, refetch: fetchData };
};
