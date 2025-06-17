"use client";

import Head from "next/head";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  useCategoryBySlug,
  useProductsByCategory,
} from "../hooks/useClientProducts";
import type { Product } from "../services/client.product.service";
import toast from "react-hot-toast";
import {
  addToCart as addToCartUtil,
  type CartItem,
} from "../../../../../utils/cartUtils";
import ProductCardShopeeStyle from "../../common/components/ProductCard";

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

function FilterBar({
  sortOption,
  onSortChange,
}: {
  sortOption: string;
  onSortChange: (value: string) => void;
}) {
  return (
    <div className="flex justify-end mb-2">
      <label className="sr-only">Sắp xếp theo</label>
      <select
        value={sortOption}
        onChange={(e) => onSortChange(e.target.value)}
        className="w-48 border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
      >
        <option value="default">Mặc định</option>
        <option value="newest">Mới nhất</option>
        <option value="oldest">Cũ nhất</option>
        <option value="price-asc">Giá tăng dần</option>
        <option value="price-desc">Giá giảm dần</option>
      </select>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { name, thumbnail, discountPrice, currentPrice, slug, _id, sku } =
    product;
  const price = discountPrice || currentPrice || 0;
  const discountPercent =
    currentPrice && discountPrice
      ? Math.round(((currentPrice - discountPrice) / currentPrice) * 100)
      : 0;

  const handleAddToCart = () => {
    const productData: CartItem = {
      _id: _id || "",
      name,
      slug,
      price,
      currentPrice,
      discountPrice,
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
        currentPrice={currentPrice}
        discountPrice={discountPrice}
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
  // const { slug } = useParams() as { slug?: string };
  const isAllProducts = !slug;
  const { category, loading: loadingCategory } = useCategoryBySlug(slug || "");
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [sortOption, setSortOption] = useState("default");

  const { products, loading, error, totalPages } = useProductsByCategory(
    isAllProducts ? null : category,
    page
  );

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

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setAllProducts([]);
  }, [category?.name]);

  useEffect(() => {
    if (!loading) {
      if (page > 1 && products.length === 0) {
        setHasMore(false);
      } else {
        // Lọc ra các sản phẩm không bị ẩn trước khi thêm vào danh sách
        const visibleProducts = products.filter((p) => p.isVisible !== true);
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

  const sortedProducts = useMemo(() => {
    // Lọc ra các sản phẩm không bị ẩn trước khi sắp xếp
    const copy = [...allProducts];

    switch (sortOption) {
      case "price-asc":
        return copy.sort(
          (a, b) =>
            (a.discountPrice || a.currentPrice || 0) -
            (b.discountPrice || b.currentPrice || 0)
        );
      case "price-desc":
        return copy.sort(
          (a, b) =>
            (b.discountPrice || b.currentPrice || 0) -
            (a.discountPrice || a.currentPrice || 0)
        );
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
          content={`Danh sách sản phẩm ${
            category?.name || "mới nhất"
          } - Giá tốt, đa dạng`}
        />
        <meta name="robots" content="index, follow" />
      </Head>

      <Breadcrumb
        categoryName={isAllProducts ? "Tất cả sản phẩm" : category?.name}
      />
      <FilterBar sortOption={sortOption} onSortChange={setSortOption} />

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
