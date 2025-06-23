"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  addToCart as addToCartUtil,
  CartItem,
} from "../../../../../utils/cartUtils";
import { Product } from "../models/product.model";
import { ProductService } from "../services/product.service";
import ProductCardShopeeStyle from "../../common/components/ProductCard";

// Xử lý ảnh sản phẩm
const getImageUrl = (thumbnail?: string) => {
  if (!thumbnail) return "/placeholder.svg";
  return thumbnail.startsWith("http")
    ? thumbnail
    : `${thumbnail}`;
};

const ProductFlashSale = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await ProductService.getByCategory("flash sale");
        const discounted = response.data
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
    if (
      !(
        (product.discountPrice && product.discountPrice > 0) ||
        (product.currentPrice && product.currentPrice > 0)
      )
    )
      return;

    const item: CartItem = {
      _id: product._id || product.id || "",
      name: product.name,
      slug: product.slug,
      basePrice: product.basePrice || 0,
      currentPrice: product.currentPrice || 0,
      discountPrice: product.discountPrice || 0,
      price: product.discountPrice || product.currentPrice || 0,
      quantity: 1,
      image: getImageUrl(product.thumbnail),
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
