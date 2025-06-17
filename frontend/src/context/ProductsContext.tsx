"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProductService } from '@/modules/admin/products/services/product.service';
import { Product } from '@/modules/admin/products/models/product.model';
import { filterProductsByCategory, filterProductsByTag, convertToSlug } from "../../utils/ProductUtil";

interface ProductsContextType {
  allProducts: Product[];
  isLoading: boolean;
  error: string | null;
  categoryCache: Record<string, Product[]>;
  tagCache: Record<string, Product[]>;
  setCategoryProducts: (slug: string, products: Product[]) => void;
  setTagProducts: (slug: string, products: Product[]) => void;
}

const ProductsContext = createContext<ProductsContextType>({
  allProducts: [],
  isLoading: true,
  error: null,
  categoryCache: {},
  tagCache: {},
  setCategoryProducts: () => {},
  setTagProducts: () => {},
});

// Constants for localStorage keys
const PRODUCTS_STORAGE_KEY = 'decor_all_products';
const CATEGORY_CACHE_KEY = 'decor_category_cache';
const TAG_CACHE_KEY = 'decor_tag_cache';
const PRODUCTS_TIMESTAMP_KEY = 'decor_products_timestamp';

// Thời gian cache hiệu lực (1 giờ)
const CACHE_EXPIRATION = 60 * 60 * 1000;

// Phân loại tất cả sản phẩm theo danh mục và tag
const categorizeAllProducts = (products: Product[]) => {
  const categoryCache: Record<string, Product[]> = {};
  const tagCache: Record<string, Product[]> = {};
  const processedCategories = new Set<string>();
  const processedTags = new Set<string>();

  // Danh sách các style được biết đến - thêm một số biến thể viết hoa
  const styleCategories = [
    'style', 'Style',
    'abstract', 'Abstract',
    'minimalist', 'Minimalist',
    'morden-farmhouse', 'modern-farmhouse', 'Modern-Farmhouse', 'Modern Farmhouse',
    'neo-classical', 'Neo-Classical', 'Neo Classical',
    'scandinavian', 'Scandinavian',
    'vintage', 'Vintage'
  ];

  // Ánh xạ tên style tới slug chuẩn
  const styleMapping: Record<string, string> = {
    'abstract': 'abstract',
    'Abstract': 'abstract',
    'minimalist': 'minimalist',
    'Minimalist': 'minimalist',
    'morden-farmhouse': 'modern-farmhouse',
    'modern-farmhouse': 'modern-farmhouse',
    'Modern-Farmhouse': 'modern-farmhouse',
    'Modern Farmhouse': 'modern-farmhouse',
    'neo-classical': 'neo-classical',
    'Neo-Classical': 'neo-classical',
    'Neo Classical': 'neo-classical',
    'scandinavian': 'scandinavian',
    'Scandinavian': 'scandinavian',
    'vintage': 'vintage',
    'Vintage': 'vintage',
    'style': 'style',
    'Style': 'style'
  };

  // Xử lý từng sản phẩm
  products.forEach(product => {
    if (!product.category) return;

    // Xử lý danh mục chính
    if (product.category.main) {
      const mainCategorySlug = convertToSlug(product.category.main);

      if (!processedCategories.has(mainCategorySlug)) {
        // Phân loại sản phẩm cho danh mục này
        categoryCache[mainCategorySlug] = filterProductsByCategory(products, mainCategorySlug);
        processedCategories.add(mainCategorySlug);
        console.log(`Pre-cached category: ${mainCategorySlug} with ${categoryCache[mainCategorySlug].length} products`);
      }
    }

    // Xử lý danh mục phụ và tìm style
    if (product.category.sub && Array.isArray(product.category.sub)) {
      product.category.sub.forEach(subCategory => {
        // Kiểm tra xem subCategory có trong danh sách style không
        const isStyleCategory = styleCategories.includes(subCategory);

        // Lấy slug chuẩn nếu là style
        let subCategorySlug = convertToSlug(subCategory);

        // Nếu là style, lấy slug chuẩn từ ánh xạ
        if (isStyleCategory && styleMapping[subCategory]) {
          subCategorySlug = styleMapping[subCategory];
        }

        if (!processedCategories.has(subCategorySlug)) {
          // Phân loại sản phẩm cho danh mục phụ này
          categoryCache[subCategorySlug] = filterProductsByCategory(products, subCategorySlug);
          processedCategories.add(subCategorySlug);

          if (isStyleCategory) {
            console.log(`Pre-cached style category: ${subCategorySlug} with ${categoryCache[subCategorySlug].length} products`);
          } else {
            console.log(`Pre-cached sub-category: ${subCategorySlug} with ${categoryCache[subCategorySlug].length} products`);
          }
        }
      });
    }

    // Xử lý tags
    if (product.category.tags && Array.isArray(product.category.tags)) {
      product.category.tags.forEach(tag => {
        const tagSlug = convertToSlug(tag);

        if (!processedTags.has(tagSlug)) {
          // Phân loại sản phẩm cho tag này
          tagCache[tagSlug] = filterProductsByTag(products, tagSlug);
          processedTags.add(tagSlug);
          console.log(`Pre-cached tag: ${tagSlug} with ${tagCache[tagSlug].length} products`);
        }
      });
    }
  });

  // Đảm bảo "style" luôn tồn tại trong cache và chứa tất cả các sản phẩm thuộc các style con
  // Tạo danh sách style từ các sản phẩm thuộc các category style con
  const styleProducts = products.filter(product => {
    if (!product.category || !product.category.sub) return false;

    // Kiểm tra xem sản phẩm có thuộc bất kỳ style nào không
    return product.category.sub.some(sub =>
      styleCategories.includes(sub) && convertToSlug(sub) !== 'style'
    );
  });

  // Cập nhật hoặc tạo mới category style
  categoryCache['style'] = styleProducts;
  processedCategories.add('style');
  console.log(`Pre-cached main style category with ${styleProducts.length} products`);

  // Đảm bảo tất cả các danh mục style con đều có trong cache
  const standardStyleSlugs = ['abstract', 'minimalist', 'modern-farmhouse', 'neo-classical', 'scandinavian', 'vintage'];

  for (const styleSlug of standardStyleSlugs) {
    if (!processedCategories.has(styleSlug)) {
      // Tạo subcategory trống
      categoryCache[styleSlug] = [];
      processedCategories.add(styleSlug);
      console.log(`Pre-cached empty style category: ${styleSlug}`);
    }
  }

  return { categoryCache, tagCache };
};

export function useProducts() {
  return useContext(ProductsContext);
}

export function ProductsProvider({ children }: { children: ReactNode }) {
  // Sử dụng state đặc biệt để tránh hydration mismatch với localStorage
  const [state, setState] = useState<{
    allProducts: Product[];
    isLoading: boolean;
    error: string | null;
    categoryCache: Record<string, Product[]>;
    tagCache: Record<string, Product[]>;
    initialized: boolean;
  }>({
    allProducts: [],
    isLoading: true,
    error: null,
    categoryCache: {},
    tagCache: {},
    initialized: false
  });

  // Xử lý khởi tạo ban đầu - tải từ localStorage
  useEffect(() => {
    // Chỉ chạy ở client-side
    if (typeof window === 'undefined') return;

    // Kiểm tra xem đã khởi tạo chưa
    if (state.initialized) return;

    try {
      // Kiểm tra localStorage cho cached products
      const cachedTimestampStr = localStorage.getItem(PRODUCTS_TIMESTAMP_KEY);
      const cachedTimestamp = cachedTimestampStr ? parseInt(cachedTimestampStr) : 0;
      const now = Date.now();
      const isExpired = (now - cachedTimestamp) > CACHE_EXPIRATION;

      // Lấy dữ liệu từ cache nếu chưa hết hạn
      if (!isExpired) {
        const productsJson = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        const categoryJson = localStorage.getItem(CATEGORY_CACHE_KEY);
        const tagJson = localStorage.getItem(TAG_CACHE_KEY);

        if (productsJson) {
          const products = JSON.parse(productsJson);
          let categoryCache = categoryJson ? JSON.parse(categoryJson) : {};
          let tagCache = tagJson ? JSON.parse(tagJson) : {};

          // Nếu cache danh mục/tag rỗng, phân loại lại sản phẩm
          if (Object.keys(categoryCache).length === 0 || Object.keys(tagCache).length === 0) {
            const categorized = categorizeAllProducts(products);
            categoryCache = categorized.categoryCache;
            tagCache = categorized.tagCache;

            // Lưu cache mới vào localStorage
            localStorage.setItem(CATEGORY_CACHE_KEY, JSON.stringify(categoryCache));
            localStorage.setItem(TAG_CACHE_KEY, JSON.stringify(tagCache));
          }

          setState({
            allProducts: products,
            isLoading: false,
            error: null,
            categoryCache,
            tagCache,
            initialized: true
          });
          return;
        }
      }

      // Nếu không có cache hoặc cache hết hạn, fetch mới
      fetchProducts();
    } catch (err) {
      console.error('Error loading from localStorage:', err);
      fetchProducts();
    }
  }, [state.initialized]);

  // Hàm fetch products từ API
  const fetchProducts = async () => {
    try {
      setState(prevState => ({ ...prevState, isLoading: true }));

      const products = await ProductService.getBasicInfo();

      // Phân loại sản phẩm ngay khi nhận được
      const { categoryCache, tagCache } = categorizeAllProducts(products.data);

      // Lưu vào localStorage
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products.data));
      localStorage.setItem(CATEGORY_CACHE_KEY, JSON.stringify(categoryCache));
      localStorage.setItem(TAG_CACHE_KEY, JSON.stringify(tagCache));
      localStorage.setItem(PRODUCTS_TIMESTAMP_KEY, Date.now().toString());

      setState({
        allProducts: products.data,
        isLoading: false,
        error: null,
        categoryCache,
        tagCache,
        initialized: true
      });
    } catch (err) {
      console.error("Lỗi khi tải sản phẩm:", err);
      setState(prevState => ({
        ...prevState,
        error: "Không thể tải danh sách sản phẩm",
        isLoading: false,
        initialized: true
      }));
    }
  };

  // Đồng bộ cache với localStorage mỗi khi cache thay đổi
  useEffect(() => {
    if (!state.initialized) return;

    try {
      localStorage.setItem(CATEGORY_CACHE_KEY, JSON.stringify(state.categoryCache));
      localStorage.setItem(TAG_CACHE_KEY, JSON.stringify(state.tagCache));
    } catch (err) {
      console.error('Error saving cache to localStorage:', err);
    }
  }, [state.categoryCache, state.tagCache, state.initialized]);

  const setCategoryProducts = (slug: string, products: Product[]) => {
    setState(prevState => ({
      ...prevState,
      categoryCache: {
        ...prevState.categoryCache,
        [slug]: products
      }
    }));
  };

  const setTagProducts = (slug: string, products: Product[]) => {
    setState(prevState => ({
      ...prevState,
      tagCache: {
        ...prevState.tagCache,
        [slug]: products
      }
    }));
  };

  return (
    <ProductsContext.Provider value={{
      allProducts: state.allProducts,
      isLoading: state.isLoading,
      error: state.error,
      categoryCache: state.categoryCache,
      tagCache: state.tagCache,
      setCategoryProducts,
      setTagProducts
    }}>
      {children}
    </ProductsContext.Provider>
  );
}