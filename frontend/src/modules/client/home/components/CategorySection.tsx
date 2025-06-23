"use client";

import type React from "react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  addToCart as addToCartUtil,
  type CartItem,
} from "../../../../../utils/cartUtils";
import { ProductService } from "../services/product.service";
import ProductCardShopeeStyle from "../../common/components/ProductCard";

// Interface cho sản phẩm đã được xử lý để hiển thị
interface DisplayProduct {
  id: string;
  name: string;
  originalPrice?: number;
  salePrice?: number;
  discountPercent: number;
  image: string;
  slug: string;
  rating?: number;
  sku?: string;
}

// Interface cho danh mục với sản phẩm
interface CategoryWithProducts {
  id: string;
  title: string;
  bannerImage: string;
  slug: string;
  products: DisplayProduct[];
}

interface ProductData {
  _id?: string;
  id?: string;
  name: string;
  currentPrice?: number;
  discountPrice?: number;
  thumbnail?: string;
  slug: string;
  rating?: number;
  sku?: string;
}

// Các slug được quy định để hiển thị (dạng slug)
const allowedCategorySlugs = [
  "decor-cao-cap",
  "do-phong-thuy",
  "den-trang-tri",
  "do-gom",
  "mo-hinh-xe-vintage",
  "san-pham-khac",
];

// Banner images tương ứng (theo thứ tự trong allowedCategorySlugs)
const images = [
  "/image/homedecor.jpg", // Decor cao cấp
  "/image/do-phong-thuy.jpg", // Đồ phong thủy
  "/image/den-trang-tri.jpg", // Đèn trang trí
  "/image/do-gom-nhaoplus.jpg", // Đồ gốm
  "/image/mohinhxe.jpg", // Mô hình xe Vintage
  "/image/san-pham-khac.jpg", // Sản phẩm khác
];

const CategorySection: React.FC = () => {
  const [categories, setCategories] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [productLimit, setProductLimit] = useState(4);

  const calculateDiscount = (
    currentPrice?: number,
    discountPrice?: number
  ): number => {
    if (!currentPrice || !discountPrice || currentPrice <= discountPrice)
      return 0;
    return Math.round(((currentPrice - discountPrice) / currentPrice) * 100);
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = (product: DisplayProduct) => {
    if (
      !(
        (product.salePrice && product.salePrice > 0) ||
        (product.originalPrice && product.originalPrice > 0)
      )
    )
      return;

    const item: CartItem = {
      _id: product.id || "",
      name: product.name,
      slug: product.slug,
      currentPrice: product.originalPrice,
      discountPrice:
        product.salePrice !== product.originalPrice
          ? product.salePrice
          : undefined,
      price: product.salePrice || product.originalPrice || 0,
      quantity: 1,
      image: product.image,
      sku: product.sku || "",
    };

    addToCartUtil(item);
    window.dispatchEvent(new Event("cartUpdated"));

    toast.success(
      <div className="flex items-center">
        <div className="mr-2 text-xl">🛒</div>
        <div className="flex flex-col">
          <span className="font-medium">Đã thêm vào giỏ hàng</span>
          <span className="text-xs mt-1 text-gray-600">1 x {product.name}</span>
        </div>
      </div>,
      {
        duration: 1500,
        style: { maxWidth: "95vw", padding: "10px 15px" },
      }
    );
  };

  // Cập nhật số lượng sản phẩm theo màn hình
  useEffect(() => {
    const getProductLimit = () => {
      if (window.innerWidth >= 1024) return 6; // PC
      if (window.innerWidth >= 768) return 4; // iPad / tablet
      return 2; // Mobile
    };

    setProductLimit(getProductLimit());

    const handleResize = () => setProductLimit(getProductLimit());
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lấy danh sách sản phẩm theo danh mục
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Gọi API lấy danh mục từ backend
        const allCategories = await ProductService.getAllCategories();
        // Define a type for category
        interface Category {
          _id: string;
          name: string;
          slug: string;
        }
        // Lọc ra các danh mục có slug nằm trong allowedCategorySlugs
        const selectedCategories = allCategories
          .filter((category: Category) =>
            allowedCategorySlugs.includes(category.slug)
          )
          .sort(
            (a: Category, b: Category) =>
              allowedCategorySlugs.indexOf(a.slug) -
              allowedCategorySlugs.indexOf(b.slug)
          );

        // Gọi API lấy sản phẩm cho từng danh mục
        const categoriesWithProducts: CategoryWithProducts[] =
          await Promise.all(
            selectedCategories.map(
              async (category: Category, index: number) => {
                const productsData = await ProductService.getByCategory(
                  category.name,
                  1,
                  6
                );



                return {
                  id: category._id,
                  title: category.name,
                  bannerImage: images[index % images.length],
                  slug: category.slug,
                  products: productsData.data.map((product: ProductData) => ({
                    id: product._id || product.id || "",
                    name: product.name,
                    originalPrice: product.currentPrice,
                    salePrice: product.discountPrice || product.currentPrice,
                    discountPercent: calculateDiscount(
                      product.currentPrice,
                      product.discountPrice
                    ),
                    image: product.thumbnail ? product.thumbnail : "./image/Logo_Decor-More1.png",
                    slug: product.slug,
                    rating: product.rating || 0,
                    sku: product.sku || "",
                  })),
                };
              }
            )
          );

        setCategories(categoriesWithProducts);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto my-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {[...Array(4)].map((_, categoryIndex) => (
            <div key={categoryIndex} className="animate-pulse">
              <div className="bg-gray-200 h-10 w-full mb-3"></div>
              <div className="bg-gray-200 h-64 w-full"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                {[...Array(6)].map((_, productIndex) => (
                  <div
                    key={productIndex}
                    className="border border-gray-200 p-2"
                  >
                    <div className="bg-gray-200 h-48 w-full"></div>
                    <div className="mt-2">
                      <div className="bg-gray-200 h-5 w-3/4 mb-2"></div>
                      <div className="bg-gray-200 h-4 w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {categories.map((category) => (
          <section
            key={category.id}
            className="flex flex-col items-center bg-white rounded-2xl shadow-lg border border-gray-100 p-4 focus-within:ring-2 focus-within:ring-blue-500 transition"
            tabIndex={0}
            aria-label={`Danh mục ${category.title}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                window.location.href = `/category/${category.slug}`;
              }
            }}
          >
            {/* Banner image */}
            <div className="w-full flex justify-center">
              <img
                src={category.bannerImage || "/placeholder.svg"}
                alt={`Banner ${category.title}`}
                className="rounded-xl border border-gray-200 shadow-sm object-cover w-full max-w-2xl h-40 mb-4"
                loading="lazy"
              />
            </div>
            <div className="w-full flex items-center justify-between px-4 mb-3">
              {/* Category title */}
              <h2 className="text-xl font-bold text-[#001f3f] uppercase tracking-wide">
                {category.title}
              </h2>
              {/* View all button */}
              <button
                className="px-3 py-2 bg-blue-100 text-blue-900 font-semibold rounded-full shadow hover:bg-blue-300 hover:text-[#001f3f] focus:outline-none focus:ring-2 focus:ring-amber-400 transition flex items-center justify-center"
                tabIndex={0}
                aria-label={`Xem tất cả sản phẩm trong ${category.title}`}
                onClick={() =>
                  (window.location.href = `/category/${category.slug}`)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    window.location.href = `/category/${category.slug}`;
                  }
                }}
                type="button"
              >
                <span>Xem tất cả</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
            </div>
            {/* Product grid - horizontal scroll on mobile, grid on desktop */}
            <div className="w-full">
              <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-4 md:overflow-x-visible">
                {category.products && category.products.length > 0 ? (
                  category.products
                    .slice(0, productLimit)
                    .map((product, index) => (
                      <div
                        key={`${category.id}-${product.id || index}`}
                        className="relative min-w-[220px] max-w-xs w-full bg-white rounded-xl shadow-sm hover:shadow-lg transition flex flex-col items-center focus-within:ring-2 focus-within:ring-amber-400 md:min-w-0 md:max-w-none"
                        tabIndex={0}
                        aria-label={`Sản phẩm ${product.name}`}
                      >
                        {/* Product card */}
                        <ProductCardShopeeStyle
                          slug={product.slug}
                          name={product.name}
                          imageUrl={product.image}
                          currentPrice={product.originalPrice}
                          discountPrice={product.salePrice}
                          onAddToCart={() => handleAddToCart(product)}
                        />
                      </div>
                    ))
                ) : (
                  <div className="col-span-2 text-center py-6 text-gray-500">
                    Không có sản phẩm trong danh mục này
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
