"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CategoriesService } from "../modules/admin/categories-product/services/categories-product.service";
import { Product } from "../modules/admin/products/models/product.model";
import { CategoriesProduct } from "../modules/admin/categories-product/types/categories-product.types";
import {
    getCategoryNameFromSlug,
    convertToSlug,
    sortProducts,
    filterProductsByCategory
} from "../../utils/ProductUtil";
import { ProductService } from "@/modules/admin/products/services/product.service";

// Khóa cho localStorage cache
const PRODUCTS_CACHE_KEY = 'decor_products_cache';
const CATEGORIES_CACHE_KEY = 'decor_categories_cache';
const CACHE_EXPIRY_TIME = 1000 * 60 * 60; // 1 giờ

interface ProductContextProps {
    // Dữ liệu sản phẩm và danh mục
    allProducts: Product[];
    allCategories: CategoriesProduct[];
    filteredProducts: Product[];
    paginatedProducts: Product[];

    // Thông tin
    categoryName: string;
    tagName: string;
    totalPages: number;

    // Trạng thái
    loading: boolean;
    isDataLoading: boolean; // Đang tải API (dành cho background)
    uiLoading: boolean; // Đang chuyển đổi UI (ẩn đi)
    error: string | null;
    sortOption: string;
    currentPage: number;

    // Các hàm xử lý
    setSortOption: (option: string) => void;
    setCurrentPage: (page: number) => void;
    filterByCategory: (slug?: string) => void;
    filterByTag: (slug?: string, isStyle?: boolean) => void;
    refreshData: () => Promise<void>;
}

const ProductContext = createContext<ProductContextProps | undefined>(undefined);

export const useProductContext = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error("useProductContext must be used within a ProductProvider");
    }
    return context;
};

interface ProductProviderProps {
    children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
    // Dữ liệu
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [allCategories, setAllCategories] = useState<CategoriesProduct[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);

    // Thông tin
    const [categoryName, setCategoryName] = useState<string>("");
    const [tagName, setTagName] = useState<string>("");

    // Trạng thái
    const [loading, setLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(false);
    const [uiLoading, setUiLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dataLoaded, setDataLoaded] = useState(false);

    // Phân trang và sắp xếp
    const [sortOption, setSortOption] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const productsPerPage = 12;

    // Trạng thái lọc hiện tại
    const [currentFilterType, setCurrentFilterType] = useState<'category' | 'tag' | 'none'>('none');
    const [currentSlug, setCurrentSlug] = useState<string | undefined>(undefined);
    const [isStyle, setIsStyle] = useState(false);

    // Kiểm tra xem cache có hợp lệ không
    const isCacheValid = (cacheKey: string) => {
        try {
            if (typeof window === 'undefined') return false;

            const cachedData = localStorage.getItem(cacheKey);
            if (!cachedData) return false;

            const { timestamp, data } = JSON.parse(cachedData);
            const isExpired = Date.now() - timestamp > CACHE_EXPIRY_TIME;

            return !isExpired && Array.isArray(data) && data.length > 0;
        } catch (error) {
            return false;
        }
    };

    // Lấy dữ liệu từ cache
    const getCachedData = <T,>(cacheKey: string): T[] | null => {
        try {
            if (typeof window === 'undefined') return null;

            const cachedData = localStorage.getItem(cacheKey);
            if (!cachedData) return null;

            const { data } = JSON.parse(cachedData);
            return data;
        } catch (error) {
            return null;
        }
    };

    // Lưu dữ liệu vào cache
    const saveToCache = <T,>(cacheKey: string, data: T[]) => {
        try {
            if (typeof window === 'undefined') return;

            const cacheObject = {
                timestamp: Date.now(),
                data
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheObject));
        } catch (error) {
            console.error(`Lỗi khi lưu cache ${cacheKey}:`, error);
        }
    };

    // Tải dữ liệu sản phẩm và danh mục
    const loadAllData = async (silent = false) => {
        if (!silent) setLoading(true);
        setIsDataLoading(true);

        try {
            let productsData: Product[] = [];
            let categoriesData: CategoriesProduct[] = [];

            // Kiểm tra cache sản phẩm
            const productsFromCache = isCacheValid(PRODUCTS_CACHE_KEY) ?
                getCachedData<Product>(PRODUCTS_CACHE_KEY) : null;

            // Kiểm tra cache danh mục
            const categoriesFromCache = isCacheValid(CATEGORIES_CACHE_KEY) ?
                getCachedData<CategoriesProduct>(CATEGORIES_CACHE_KEY) : null;

            // Tải dữ liệu sản phẩm
            if (productsFromCache) {
                console.log("Sử dụng sản phẩm từ cache");
                productsData = productsFromCache;
            } else {
                console.log("Tải sản phẩm từ API");
                const productsResponse = await ProductService.getAll();
                productsData = productsResponse.data;
                saveToCache(PRODUCTS_CACHE_KEY, productsData);
            }

            // Tải dữ liệu danh mục
            if (categoriesFromCache) {
                console.log("Sử dụng danh mục từ cache");
                categoriesData = categoriesFromCache;
            } else {
                console.log("Tải danh mục từ API");
                categoriesData = await CategoriesService.getAll();
                saveToCache(CATEGORIES_CACHE_KEY, categoriesData);
            }

            // Cập nhật state
            setAllProducts(productsData);
            setAllCategories(categoriesData);
            setDataLoaded(true);
            setError(null);
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu:", err);

            // Thử dùng cache trong trường hợp lỗi
            const productsFromCache = getCachedData<Product>(PRODUCTS_CACHE_KEY);
            const categoriesFromCache = getCachedData<CategoriesProduct>(CATEGORIES_CACHE_KEY);

            if (productsFromCache) {
                console.log("Sử dụng sản phẩm từ cache (emergency fallback)");
                setAllProducts(productsFromCache);
            }

            if (categoriesFromCache) {
                console.log("Sử dụng danh mục từ cache (emergency fallback)");
                setAllCategories(categoriesFromCache);
            }

            if (productsFromCache && categoriesFromCache) {
                setDataLoaded(true);
                setError(null);
            } else {
                setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
            }
        } finally {
            setIsDataLoading(false);
            if (!silent) setLoading(false);
        }
    };

    // Làm mới dữ liệu (gọi API) nhưng không ảnh hưởng đến UI
    const refreshData = async () => {
        try {
            setIsDataLoading(true);
            const [productsData, categoriesData] = await Promise.all([
                ProductService.getAll(),
                CategoriesService.getAll()
            ]);

            // Lưu vào cache
            saveToCache(PRODUCTS_CACHE_KEY, productsData.data);
            saveToCache(CATEGORIES_CACHE_KEY, categoriesData);

            // Chỉ cập nhật state nếu dữ liệu thực sự khác
            if (JSON.stringify(productsData) !== JSON.stringify(allProducts)) {
                setAllProducts(productsData.data);
            }

            if (JSON.stringify(categoriesData) !== JSON.stringify(allCategories)) {
                setAllCategories(categoriesData);
            }
        } catch (error) {
            console.log("Cập nhật ngầm thất bại, không ảnh hưởng đến người dùng");
        } finally {
            setIsDataLoading(false);
        }
    };

    // Lọc sản phẩm theo danh mục
    const filterByCategory = (slug?: string) => {
        setCurrentFilterType('category');
        setCurrentSlug(slug);
        setIsStyle(false);

        // Reset trang về 1
        setCurrentPage(1);
    };

    // Lọc sản phẩm theo tag
    const filterByTag = (slug?: string, style = false) => {
        setCurrentFilterType('tag');
        setCurrentSlug(slug);
        setIsStyle(style);

        // Reset trang về 1
        setCurrentPage(1);
    };

    // Xử lý lọc dữ liệu
    useEffect(() => {
        if (!dataLoaded) return;

        const applyFilters = () => {
            let filteredData: Product[] = [];

            if (currentFilterType === 'category') {
                if (!currentSlug || currentSlug === '') {
                    // Hiển thị tất cả sản phẩm cho trang danh mục gốc
                    filteredData = allProducts;
                    setCategoryName("Tất cả danh mục");
                } else {
                    // Tìm thông tin danh mục từ dữ liệu đã lưu
                    const categoryData = allCategories.find(cat => cat.slug === currentSlug);

                    if (categoryData) {
                        setCategoryName(categoryData.name);

                        // Lọc sản phẩm thuộc danh mục hiện tại và cả danh mục con (nếu có)
                        filteredData = filterProductsByCategory(allProducts, currentSlug);

                        // Xử lý danh mục con
                        if (categoryData.children && categoryData.children.length > 0) {
                            const childProducts = allProducts.filter(product => {
                                if (!product.category) return false;

                                return categoryData.children.some(childCat => {
                                    // So sánh với category.main
                                    if (convertToSlug(product.category?.main || '') === childCat.slug) {
                                        return true;
                                    }

                                    // So sánh với category.sub
                                    if (product.category?.sub) {
                                        return product.category.sub.some(subCat =>
                                            convertToSlug(subCat) === childCat.slug
                                        );
                                    }

                                    return false;
                                });
                            });

                            // Kết hợp sản phẩm từ danh mục hiện tại và các danh mục con
                            const combinedProducts = [...filteredData];

                            // Thêm sản phẩm từ danh mục con mà chưa có trong filtered
                            childProducts.forEach(product => {
                                if (!combinedProducts.some(p => p.id === product.id)) {
                                    combinedProducts.push(product);
                                }
                            });

                            filteredData = combinedProducts;
                        }
                    } else {
                        // Sử dụng phương pháp cũ để lọc sản phẩm
                        filteredData = filterProductsByCategory(allProducts, currentSlug);

                        // Lấy tên danh mục từ sản phẩm hoặc tạo từ slug
                        if (filteredData.length > 0 && filteredData[0].category?.main) {
                            setCategoryName(filteredData[0].category.main);
                        } else {
                            setCategoryName(getCategoryNameFromSlug(currentSlug));
                        }
                    }
                }
            } else if (currentFilterType === 'tag') {
                if (currentSlug) {
                    // Lọc sản phẩm theo tag và category.sub
                    filteredData = allProducts.filter(product => {
                        if (!product.category) return false;

                        // Kiểm tra trong tags nếu có
                        if (product.category.tags && product.category.tags.length > 0) {
                            if (product.category.tags.some(tag =>
                                convertToSlug(tag) === currentSlug
                            )) {
                                return true;
                            }
                        }

                        // Kiểm tra trong sub categories
                        if (product.category.sub && product.category.sub.length > 0) {
                            if (product.category.sub.some(subCat =>
                                convertToSlug(subCat) === currentSlug
                            )) {
                                return true;
                            }
                        }

                        return false;
                    });

                    // Lấy tên tag/style từ slug hoặc từ sản phẩm đầu tiên
                    if (filteredData.length > 0 && filteredData[0].category) {
                        // Tìm trong tags trước
                        if (filteredData[0].category.tags) {
                            const matchingTag = filteredData[0].category.tags.find(tag =>
                                convertToSlug(tag) === currentSlug
                            );
                            if (matchingTag) {
                                setTagName(matchingTag);
                            }
                        }

                        // Nếu không tìm thấy trong tags, tìm trong sub categories
                        if (!tagName && filteredData[0].category.sub) {
                            const matchingSubCat = filteredData[0].category.sub.find(subCat =>
                                convertToSlug(subCat) === currentSlug
                            );
                            if (matchingSubCat) {
                                setTagName(matchingSubCat);
                            }
                        }

                        // Nếu không tìm thấy, chuyển đổi từ slug
                        if (!tagName) {
                            setTagName(getCategoryNameFromSlug(currentSlug));
                        }
                    } else {
                        setTagName(getCategoryNameFromSlug(currentSlug));
                    }
                } else {
                    filteredData = allProducts;
                }
            } else {
                // Không có bộ lọc, hiển thị tất cả sản phẩm
                filteredData = allProducts;
            }

            setFilteredProducts(filteredData);
        };

        applyFilters();
    }, [currentFilterType, currentSlug, dataLoaded, allProducts, allCategories]);

    // Xử lý phân trang và sắp xếp
    useEffect(() => {
        if (filteredProducts.length > 0) {
            // Sắp xếp
            const sorted = sortProducts(filteredProducts, sortOption);

            // Tính toán phân trang
            const totalPages = Math.ceil(sorted.length / productsPerPage);
            setTotalPages(totalPages);

            // Lấy sản phẩm cho trang hiện tại
            const startIndex = (currentPage - 1) * productsPerPage;
            const endIndex = startIndex + productsPerPage;
            const paginatedItems = sorted.slice(startIndex, endIndex);

            setPaginatedProducts(paginatedItems);
        } else {
            setPaginatedProducts([]);
            setTotalPages(1);
        }
    }, [filteredProducts, sortOption, currentPage]);

    // Tải dữ liệu ban đầu khi component mount
    useEffect(() => {
        loadAllData(true);

        // Cập nhật dữ liệu ngầm mỗi 15 phút
        const refreshInterval = setInterval(() => {
            refreshData();
        }, 15 * 60 * 1000);

        return () => clearInterval(refreshInterval);
    }, []);

    const contextValue: ProductContextProps = {
        allProducts,
        allCategories,
        filteredProducts,
        paginatedProducts,
        categoryName,
        tagName,
        totalPages,
        loading,
        isDataLoading,
        uiLoading,
        error,
        sortOption,
        currentPage,
        setSortOption,
        setCurrentPage,
        filterByCategory,
        filterByTag,
        refreshData
    };

    return (
        <ProductContext.Provider value={contextValue}>
            {children}
        </ProductContext.Provider>
    );
};