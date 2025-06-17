"use client";

import { CategoriesService } from '@/modules/admin/categories-product/services/categories-product.service';
import { CategoriesProduct } from '@/modules/admin/categories-product/types/categories-product.types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Biến toàn cục để lưu trữ dữ liệu qua các lần render
let cachedCategories: CategoryItem[] = [];
let isFetching = false;
let hasError: string | null = null;

interface CategoryChild {
    _id: string;
    name: string;
    slug: string;
    hasChildren?: boolean;
    children?: CategoryChild[];
}

interface CategoryItem {
    _id: string;
    name: string;
    slug: string;
    hasChildren?: boolean;
    children?: CategoryChild[];
}

interface CategoriesContextType {
    categories: CategoryItem[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>; // Thêm function refetch
}

const CategoriesContext = createContext<CategoriesContextType>({
    categories: [],
    loading: true,
    error: null,
    refetch: async () => { }
});

export function useCategories() {
    return useContext(CategoriesContext);
}

export function CategoriesProvider({ children }: { children: ReactNode }) {
    const [categories, setCategories] = useState<CategoryItem[]>(cachedCategories);
    const [loading, setLoading] = useState(cachedCategories.length === 0);
    const [error, setError] = useState<string | null>(hasError);

    const fetchCategories = async () => {
        // Nếu đã có dữ liệu hoặc đang tải, không tải lại
        if (isFetching) return;

        try {
            isFetching = true;
            setLoading(true);

            const data = await CategoriesService.getAll();

            // Chuyển đổi dữ liệu từ API sang định dạng cần thiết
            const formattedCategories = formatCategories(data);

            // Cập nhật cả biến toàn cục và state
            cachedCategories = formattedCategories;
            setCategories(formattedCategories);

            hasError = null;
            setError(null);
        } catch (err) {
            console.error("Lỗi khi lấy danh mục:", err);
            hasError = "Không thể tải danh mục sản phẩm. Vui lòng thử lại sau.";
            setError(hasError);
        } finally {
            isFetching = false;
            setLoading(false);
        }
    };

    useEffect(() => {
        // Chỉ tải dữ liệu nếu chưa có trong cache
        if (cachedCategories.length === 0 && !isFetching) {
            fetchCategories();
        }
    }, []);

    // Hàm chuyển đổi dữ liệu API thành cấu trúc phân cấp
    const formatCategories = (categoriesData: CategoriesProduct[]): CategoryItem[] => {
        // Tìm các danh mục gốc (không có parentCategory)
        const rootCategories = categoriesData.filter(cat => !cat.parentCategory);

        // Xây dựng cây phân cấp
        const buildCategoryHierarchy = (category: CategoriesProduct): CategoryItem => {
            const children = categoriesData.filter(cat => cat.parentCategory === category._id);

            return {
                _id: category._id,
                name: category.name,
                slug: category.slug,
                hasChildren: children.length > 0,
                children: children.length > 0
                    ? children.map(child => buildCategoryHierarchy(child))
                    : undefined
            };
        };

        return rootCategories.map(rootCat => buildCategoryHierarchy(rootCat));
    };

    return (
        <CategoriesContext.Provider value={{
            categories,
            loading,
            error,
            refetch: fetchCategories // Cung cấp function refetch
        }}>
            {children}
        </CategoriesContext.Provider>
    );
}
