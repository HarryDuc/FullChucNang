"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Product } from "../models/product.model";
import { ProductService } from "../services/product.service";
import ProductCardShopeeStyle from "../../common/components/ProductCard";
import {
  type CartItem,
  addToCart as addToCartUtil,
  formatPrice as formatPriceUtil,
} from "../../../../../utils/cartUtils";
import toast from "react-hot-toast";
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
const Search = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLoading, setIsFirstLoading] = useState(true); // ✅ để hiển thị loading đầu tiên
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef<HTMLDivElement | null>(null);
  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = (product: DisplayProduct) => {
    const productData: CartItem = {
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
    addToCartUtil(productData);
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success(
      <div className="flex items-start gap-2">
        <span>🛒</span>
        <div>
          <strong>Đã thêm vào giỏ</strong>
          <div className="text-xs text-gray-600">{product.name}</div>
        </div>
      </div>,
      { duration: 1500 }
    );
  };
  // ✅ Reset khi query thay đổi
  useEffect(() => {
    setResults([]);
    setPage(1);
    setHasMore(true);
    setIsFirstLoading(true);
  }, [query]);

  // ✅ Gọi API khi query hoặc page thay đổi
  useEffect(() => {
    if (!query || !hasMore) return;

    const fetchResults = async () => {
      try {
        setIsLoading(true);
        const { data, totalPages } = await ProductService.searchByName(
          query,
          page
        );

        // ❗ tránh trùng slug
        setResults((prev) => {
          const existingSlugs = new Set(prev.map((item) => item.slug));
          const uniqueNew = data.filter(
            (item) => !existingSlugs.has(item.slug)
          );
          return [...prev, ...uniqueNew];
        });

        setHasMore(page < totalPages);
      } catch (error) {
        console.error("Lỗi khi tìm kiếm sản phẩm:", error);
        setHasMore(false);
      } finally {
        setIsLoading(false);
        setIsFirstLoading(false);
      }
    };

    fetchResults();
  }, [query, page]);

  // ✅ IntersectionObserver để auto load thêm khi scroll gần cuối
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    const current = observerRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [isLoading, hasMore]);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">
        Kết quả tìm kiếm cho: "{query}"
      </h1>

      {isFirstLoading ? (
        <p>Đang tải kết quả...</p>
      ) : results.length === 0 ? (
        <p>Không tìm thấy sản phẩm phù hợp.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {results.map((product) => (
            <div key={product._id}>
              <ProductCardShopeeStyle
                slug={product.slug}
                name={product.name}
                imageUrl={`${product.thumbnail}`}
                currentPrice={product.currentPrice}
                discountPrice={product.discountPrice}
                onAddToCart={() => handleAddToCart(product as DisplayProduct)}
              />
            </div>
          ))}
        </div>
      )}

      {/* ✅ Hiển thị loading khi đang gọi thêm trang */}
      {isLoading && !isFirstLoading && (
        <div className="text-center mt-4 text-gray-500">
          Đang tải thêm sản phẩm...
        </div>
      )}

      {/* ✅ Đây là điểm để trigger scroll */}
      <div ref={observerRef} className="h-1" />
    </div>
  );
};

export default Search;
