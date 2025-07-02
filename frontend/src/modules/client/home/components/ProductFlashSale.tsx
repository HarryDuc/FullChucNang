"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  addToCart as addToCartUtil,
  CartItem,
} from "../../../../../utils/cartUtils";
import { ProductService } from "../services/product.service";
import ProductCardShopeeStyle from "../../common/components/ProductCard";

// Thêm interface cho variant
interface ProductVariant {
  variantCurrentPrice?: number;
  variantDiscountPrice?: number;
}

// Mở rộng interface Product
interface Product {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  basePrice?: number;
  currentPrice?: number;
  discountPrice?: number;
  thumbnail?: string;
  sku?: string;
  hasVariants?: boolean;
  variants?: ProductVariant[];
}

// Xử lý ảnh sản phẩm
const getImageUrl = (thumbnail?: string) => {
  if (!thumbnail) return "/placeholder.svg";
  return thumbnail.startsWith("http") ? thumbnail : `${thumbnail}`;
};

const ProductFlashSale = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await ProductService.getByCategory("flash sale");
        const discounted = response.data;
        console.log(discounted);
        setProducts(discounted.slice(0, 12));
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    // Tìm giá thấp nhất trong các variants
    const getLowestVariantPrices = () => {
      if (!product.variants || product.variants.length === 0)
        return { lowest: product.basePrice || 0, lowestDiscount: undefined };

      let lowest = Infinity;
      let lowestDiscount = Infinity;

      product.variants.forEach((variant) => {
        // Cập nhật giá gốc thấp nhất
        if (
          variant.variantCurrentPrice !== undefined &&
          variant.variantCurrentPrice < lowest
        ) {
          lowest = variant.variantCurrentPrice;
        }
        // Cập nhật giá khuyến mãi thấp nhất
        if (
          variant.variantDiscountPrice !== undefined &&
          variant.variantDiscountPrice < lowestDiscount
        ) {
          lowestDiscount = variant.variantDiscountPrice;
        }
      });

      return {
        lowest: lowest === Infinity ? product.basePrice || 0 : lowest,
        lowestDiscount:
          lowestDiscount === Infinity ? undefined : lowestDiscount,
      };
    };

    // Xác định giá hiển thị dựa trên việc có variant hay không
    const { lowest, lowestDiscount } = product.hasVariants
      ? getLowestVariantPrices() // Có variant -> lấy giá thấp nhất từ variants
      : {
          lowest: product.currentPrice || product.basePrice || 0,
          lowestDiscount: product.discountPrice,
        }; // Không có variant -> giữ nguyên logic cũ

    const displayPrice = lowest;
    const displayDiscountPrice = lowestDiscount;
    const finalPrice = displayDiscountPrice || displayPrice;

    if (!(finalPrice > 0)) return;

    const item: CartItem = {
      _id: product._id || product.id || "",
      name: product.name,
      slug: product.slug,
      currentPrice: displayPrice,
      discountPrice: displayDiscountPrice,
      price: finalPrice,
      quantity: 1,
      image: getImageUrl(product.thumbnail),
      sku: product.sku,
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

  if (loading) {
    return (
      <div
        role="status"
        aria-label="Đang tải sản phẩm khuyến mãi"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2"
      >
        {[...Array(12)].map((_, i) => (
          <div key={i} className="p-4 bg-white border animate-pulse">
            <div className="h-48 w-full bg-gray-200 mb-4" />
            <div className="h-4 w-2/3 bg-gray-200 mb-2" />
            <div className="h-4 w-1/3 bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <section
      aria-label="Flash Sale - Sản phẩm đang giảm giá"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2"
    >
      {products.map((product) => {
        return (
          <div key={product._id || product.id}>
            <ProductCardShopeeStyle
              slug={product.slug}
              name={product.name}
              imageUrl={getImageUrl(product.thumbnail)}
              currentPrice={product.basePrice}
              discountPrice={product.discountPrice}
              onAddToCart={() => handleAddToCart(product)}
            />
          </div>
        );
      })}
    </section>
  );
};

export default ProductFlashSale;
