import React from "react";
import ProductCardShopeeStyle from "../../common/components/ProductCard";
import toast from "react-hot-toast";
import {
  addToCart as addToCartUtil,
  type CartItem,
} from "../../../../../utils/cartUtils";

interface RelatedProductsProps {
  relatedProducts: any[];
}
const handleAddToCart = (product: any) => {
  const productData: CartItem = {
    _id: product._id || "",
    name: product.name,
    slug: product.slug,
    price: product.price,
    currentPrice: product.currentPrice,
    discountPrice: product.discountPrice,
    quantity: 1,
    image: product.thumbnail?.startsWith("http")
      ? product.thumbnail
      : `${product.thumbnail}`,
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
const RelatedProducts: React.FC<RelatedProductsProps> = ({ relatedProducts }) => (
  <section className="relative pb-8 px-2" aria-labelledby="related-products-heading">
    <h3 id="related-products-heading" className="text-2xl ml-5 text-gray-700 font-bold mb-6">Sản phẩm tương tự</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {relatedProducts.map((item) => {
        return (
          <div key={item._id || item.slug}>
            <ProductCardShopeeStyle
              slug={item.slug}
              name={item.name}
              imageUrl={`${item.thumbnail}`}
              currentPrice={item.currentPrice}
              discountPrice={item.discountPrice}
              onAddToCart={() => handleAddToCart(item)}
            />
          </div>
        );
      })}
    </div>
  </section>
);

export default RelatedProducts;