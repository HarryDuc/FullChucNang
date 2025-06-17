import { Product } from "@/modules/client/products/models/product.model";

/**
 * Format giá tiền theo định dạng Việt Nam
 */
export const formatPrice = (price?: number): string => {
    if (!price) return "Liên hệ";
    return price.toLocaleString("vi-VN", { style: "decimal" }).replace(/\./g, ".") + "₫";
};

/**
 * Tính % giảm giá
 */
export const calculateDiscount = (currentPrice?: number, discountPrice?: number): number => {
    if (!currentPrice || !discountPrice || currentPrice <= discountPrice) return 0;
    return Math.round(((currentPrice - discountPrice) / currentPrice) * 100);
};

/**
 * Sắp xếp sản phẩm
 */
export const sortProducts = (products: Product[], sortOption: string): Product[] => {
    const sortedProducts = [...products];

    switch (sortOption) {
        case "price-low":
            sortedProducts.sort((a, b) => (a.discountPrice || 0) - (b.discountPrice || 0));
            break;
        case "price-high":
            sortedProducts.sort((a, b) => (b.discountPrice || 0) - (a.discountPrice || 0));
            break;
        case "name-asc":
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case "name-desc":
            sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case "newest":
        default:
            // Giả sử createdAt là timestamp chuỗi ISO
            sortedProducts.sort((a, b) => {
                return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
            });
            break;
    }

    return sortedProducts;
};

/**
 * Chuyển đổi tên danh mục thành slug (nhất quán trong toàn bộ ứng dụng)
 */
export const convertToSlug = (text: string): string => {
    return removeVietnameseDiacritics(text)
        .toLowerCase()
        .replace(/\s+/g, '-')     // Thay thế khoảng trắng bằng dấu gạch ngang
        .replace(/[^\w\-]+/g, '') // Loại bỏ ký tự đặc biệt
        .replace(/\-\-+/g, '-')   // Thay thế nhiều dấu gạch ngang liên tiếp bằng một dấu
        .replace(/^-+/, '')       // Cắt dấu gạch ngang ở đầu
        .replace(/-+$/, '');      // Cắt dấu gạch ngang ở cuối
};

/**
 * Lọc sản phẩm theo danh mục
 */
export const filterProductsByCategory = (products: any[], categorySlug: string): any[] => {
    if (!products || products.length === 0) return [];

    // Một số danh mục đặc biệt như "Style" và các danh mục con của nó thường nằm trong category.sub
    // dù chúng là danh mục chính hoặc danh mục style
    const isStyleCategory = ['style', 'abstract', 'minimalist', 'modern-farmhouse', 'neo-classical', 'scandinavian', 'vintage'].includes(categorySlug.toLowerCase());

    // Ánh xạ từ slug sang các dạng viết tắt có thể gặp trong category.sub
    const styleVariations: Record<string, string[]> = {
        'abstract': ['Abstract', 'abstract', 'Abstract Art', 'abstract art'],
        'minimalist': ['Minimalist', 'minimalist', 'Minimal', 'minimal'],
        'modern-farmhouse': ['Modern Farmhouse', 'modern farmhouse', 'Modern-Farmhouse', 'Morden Farmhouse'],
        'neo-classical': ['Neo Classical', 'Neo-Classical', 'neo-classical', 'Neo classical', 'Neoclassical'],
        'scandinavian': ['Scandinavian', 'scandinavian', 'Scandi', 'Nordic'],
        'vintage': ['Vintage', 'vintage', 'Retro', 'retro'],
        'style': ['Style', 'style']
    };

    return products.filter(product => {
        if (!product.category) return false;

        const mainCategorySlug = convertToSlug(product.category.main || '');

        // Kiểm tra nếu slug khớp với danh mục chính
        if (mainCategorySlug === categorySlug) {
            return true;
        }

        // Kiểm tra trong category.sub
        if (product.category.sub && Array.isArray(product.category.sub)) {
            // Nếu là style, kiểm tra theo biến thể
            if (isStyleCategory) {
                const possibleVariations = styleVariations[categorySlug] || [categorySlug];

                return product.category.sub.some((subCategory: string) => {
                    // So sánh trực tiếp với các biến thể
                    if (possibleVariations.includes(subCategory)) {
                        return true;
                    }

                    // So sánh theo slug
                    const subCategorySlug = convertToSlug(subCategory);
                    return subCategorySlug === categorySlug;
                });
            } else {
                // Với các danh mục thông thường, kiểm tra theo slug
                return product.category.sub.some((subCategory: string) => {
                    const subCategorySlug = convertToSlug(subCategory);
                    return subCategorySlug === categorySlug;
                });
            }
        }

        return false;
    });
};

/**
 * Tạo tên danh mục từ slug
 */
export const getCategoryNameFromSlug = (slug: string): string => {
    return slug.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
};

/**
 * Loại bỏ dấu tiếng Việt và chuyển sang dạng không dấu
 * Ví dụ: "Décor Cao Cấp" -> "Decor Cao Cap"
 */
export const removeVietnameseDiacritics = (str: string): string => {
    return str.normalize("NFD")                     // Tách các kí tự và dấu phụ
             .replace(/đ/g, "d")                    // Thay thế đ -> d
             .replace(/Đ/g, "D")                    // Thay thế Đ -> D
             .replace(/[\u0300-\u036f]/g, "");      // Loại bỏ các kí tự dấu còn lại
};

// Hàm lọc sản phẩm theo tag
export const filterProductsByTag = (products: any[], tagSlug: string): any[] => {
    if (!products || products.length === 0) return [];

    // Danh sách các style được biết đến
    const styleCategories = ['style', 'abstract', 'minimalist', 'morden-farmhouse', 'modern-farmhouse', 'neo-classical', 'scandinavian', 'vintage'];

    // Kiểm tra nếu tag là một loại style
    const isStyleTag = styleCategories.includes(tagSlug.toLowerCase());

    return products.filter(product => {
        if (!product.category) return false;

        // Nếu là style tag, kiểm tra trong category.sub
        if (isStyleTag && product.category.sub && Array.isArray(product.category.sub)) {
            return product.category.sub.some((subCategory: string) => {
                const subCategorySlug = convertToSlug(subCategory);
                return subCategorySlug === tagSlug;
            });
        }

        // Kiểm tra trong mảng category.tags
        if (product.category.tags && Array.isArray(product.category.tags)) {
            return product.category.tags.some((tag: string) => {
                const convertedTagSlug = convertToSlug(tag);
                return convertedTagSlug === tagSlug;
            });
        }

        return false;
    });
};
