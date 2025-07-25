"use client";

import Head from "next/head";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  useCategoryBySlug,
  useProductsByCategory,
} from "./hooks/useClientProducts";
import type { Product } from "./services/client.product.service";
import toast from "react-hot-toast";
import {
  addToCart as addToCartUtil,
  type CartItem,
} from "../../../../utils/cartUtils";
import ProductCardShopeeStyle from "../common/components/ProductCard";
import { useCategoryFilters } from './hooks/useCategoryFilters';
import ProductFilterSelector from '@/modules/client/products/components/ProductFilterSelector';
import FilterSection from "./components/FilterSection";
import Filter from "./components/Filter";

function Breadcrumb({ categoryName }: { categoryName?: string }) {
  return (
    <nav aria-label="Breadcrumb" className="hidden lg:block">
      <ol
        itemScope
        itemType="https://schema.org/BreadcrumbList"
        className="flex flex-wrap gap-x-2 text-sm text-gray-600"
      >
        <li
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <Link
            href="/"
            itemProp="item"
            className="text-gray-700 hover:text-orange-500 font-medium"
          >
            <span itemProp="name">Trang chủ</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>
        <li className="text-gray-400">/</li>
        <li
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <span
            itemProp="name"
            className="text-gray-700 font-semibold truncate max-w-[200px]"
          >
            {categoryName || "Tất cả sản phẩm"}
          </span>
          <meta itemProp="position" content="2" />
        </li>
      </ol>
    </nav>
  );
}


function ProductCard({ product }: { product: Product }) {
  const {
    name,
    thumbnail,
    discountPrice,
    currentPrice,
    basePrice,
    slug,
    _id,
    sku,
    hasVariants,
    variants,
  } = product;

  // Tìm giá thấp nhất trong các variants
  const getLowestVariantPrices = () => {
    if (!variants || variants.length === 0)
      return { lowest: basePrice || 0, lowestDiscount: undefined };

    let lowest = Infinity;
    let lowestDiscount = Infinity;
    let hasDiscount = false;

    variants.forEach((variant) => {
      // Cập nhật giá gốc thấp nhất
      if (
        variant.variantCurrentPrice !== undefined &&
        variant.variantCurrentPrice < lowest
      ) {
        lowest = variant.variantCurrentPrice;
      }
      // Cập nhật giá khuyến mãi thấp nhất - chỉ tính khi giá khuyến mãi > 0
      if (
        variant.variantDiscountPrice !== undefined &&
        variant.variantDiscountPrice > 0 &&
        variant.variantDiscountPrice < lowestDiscount
      ) {
        lowestDiscount = variant.variantDiscountPrice;
        hasDiscount = true;
      }
    });

    // Nếu không có variant nào có discountPrice > 0, thì hiển thị currentPrice như discountPrice
    if (!hasDiscount) {
      return {
        lowest: lowest === Infinity ? basePrice || 0 : lowest,
        lowestDiscount: lowest === Infinity ? undefined : lowest,
      };
    }

    return {
      lowest: lowest === Infinity ? basePrice || 0 : lowest,
      lowestDiscount: lowestDiscount === Infinity ? undefined : lowestDiscount,
    };
  };

  // Xác định giá hiển thị dựa trên việc có variant hay không
  const { lowest, lowestDiscount } = hasVariants
    ? getLowestVariantPrices() // Có variant -> lấy giá thấp nhất từ variants
    : { lowest: currentPrice || basePrice || 0, lowestDiscount: discountPrice }; // Không có variant -> giữ nguyên logic cũ

  const displayPrice = lowest;
  const displayDiscountPrice = lowestDiscount;
  const finalPrice = displayDiscountPrice || displayPrice;

  const handleAddToCart = () => {
    const productData: CartItem = {
      _id: _id || "",
      name,
      slug,
      currentPrice: displayPrice,
      discountPrice: displayDiscountPrice,
      price: finalPrice,
      quantity: 1,
      image: thumbnail?.startsWith("http") ? thumbnail : `${thumbnail}`,
      sku: sku || "",
    };
    addToCartUtil(productData);
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success(
      <div className="flex items-start gap-2">
        <span>🛒</span>
        <div>
          <strong>Đã thêm vào giỏ</strong>
          <div className="text-xs text-gray-600">{name}</div>
        </div>
      </div>,
      { duration: 1500 }
    );
  };

  return (
    <article
      className="relative bg-white hover:shadow transition"
      itemScope
      itemType="https://schema.org/Product"
    >
      <ProductCardShopeeStyle
        slug={slug}
        name={name}
        imageUrl={`${thumbnail}`}
        currentPrice={displayPrice}
        discountPrice={displayDiscountPrice}
        onAddToCart={handleAddToCart}
      />
    </article>
  );
}

function ProductList({ products }: { products: Product[] }) {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {products.map((product) => (
        <ProductCard key={`${product.slug}-${product._id}`} product={product} />
      ))}
    </section>
  );
}

export default function ProductListSection({ slug }: { slug: string }) {
  const isAllProducts = !slug;
  const { category, loading: loadingCategory } = useCategoryBySlug(slug || "");
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [sortOption, setSortOption] = useState("default");

  // Add filter states
  const {
    selectedFilters,
    updateFilters,
    loading: loadingFilters,
  } = useCategoryFilters(category?.id || category?._id);

  // Debug logs
  useEffect(() => {
    console.log('Category:', category);
    console.log('Selected Filters:', selectedFilters);
  }, [category, selectedFilters]);

  const { products, loading, error, totalPages } = useProductsByCategory(
    isAllProducts ? null : category,
    page,
    selectedFilters
  );

  // Debug log for products response
  useEffect(() => {
    if (!loading) {
      console.log('Products Response:', { products, error, totalPages });
    }
  }, [products, loading, error, totalPages]);

  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // Update products fetching to use filters
  useEffect(() => {
    if (!loading) {
      if (page > 1 && products.length === 0) {
        setHasMore(false);
      } else {
        const visibleProducts = products.filter((p) => p.isVisible !== false);
        setAllProducts((prev) =>
          page === 1
            ? visibleProducts
            : [
              ...prev,
              ...visibleProducts.filter(
                (p) => !prev.some((i) => i._id === p._id)
              ),
            ]
        );
        setHasMore(page < totalPages);
      }
    }
  }, [products, loading, page, totalPages]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setAllProducts([]);
    setHasMore(true);
  }, [selectedFilters, category?.name]);

  const sortedProducts = useMemo(() => {
    const copy = [...allProducts];

    const getLowestPrice = (product: Product) => {
      if (!product.hasVariants) {
        return product.discountPrice || product.currentPrice || 0;
      }

      if (!product.variants || product.variants.length === 0) {
        return product.basePrice || 0;
      }

      let lowestPrice = Infinity;
      product.variants.forEach((variant) => {
        const variantPrice =
          variant.variantDiscountPrice || variant.variantCurrentPrice;
        if (variantPrice !== undefined && variantPrice < lowestPrice) {
          lowestPrice = variantPrice;
        }
      });

      return lowestPrice === Infinity ? product.basePrice || 0 : lowestPrice;
    };

    switch (sortOption) {
      case "price-asc":
        return copy.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
      case "price-desc":
        return copy.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
      case "newest":
        return copy.sort(
          (a, b) =>
            new Date(b.publishedAt || b.createdAt).getTime() -
            new Date(a.publishedAt || a.createdAt).getTime()
        );
      case "oldest":
        return copy.sort(
          (a, b) =>
            new Date(a.publishedAt || a.createdAt).getTime() -
            new Date(b.publishedAt || b.createdAt).getTime()
        );
      default:
        return copy;
    }
  }, [allProducts, sortOption]);

  if (!isAllProducts && loadingCategory) {
    return (
      <main className="p-4 text-center text-gray-500 text-sm">
        Đang tải danh mục sản phẩm...
      </main>
    );
  }

  const pageTitle = isAllProducts
    ? "Tất cả sản phẩm"
    : category?.name
      ? `Sản phẩm thuộc ${category.name}`
      : "Tất cả sản phẩm";

  return (
    <main className="md:p-2 space-y-4">
      <Head>
        <title>{pageTitle} | Website</title>
        <meta
          name="description"
          content={`Danh sách sản phẩm ${category?.name || "mới nhất"
            } - Giá tốt, đa dạng`}
        />
        <meta name="robots" content="index, follow" />
      </Head>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <Breadcrumb
          categoryName={isAllProducts ? "Tất cả sản phẩm" : category?.name}
        />
        <FilterSection
          sortOption={sortOption}
          onSortChange={setSortOption}
          categoryId={category?._id}
          onFilterChange={updateFilters}
          selectedFilters={selectedFilters}
          loading={loadingFilters}
        />
      </div>

      {/* <Filter
        categoryId={category?._id || ""}
        selectedFilters={selectedFilters}
        onFilterChange={updateFilters}
        loading={loadingFilters}
      /> */}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && allProducts.length === 0 && (
        <p className="text-center text-gray-500 text-sm">
          Không có sản phẩm nào trong danh mục này.
        </p>
      )}

      <ProductList products={sortedProducts} />

      {hasMore && <div ref={loadMoreRef} className="h-10" />}

      {loading && page > 1 && (
        <p className="text-center text-sm text-gray-400">Đang tải thêm...</p>
      )}
    </main>
  );
}
