import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaShoppingCart, FaMinus, FaPlus, FaTimes } from "react-icons/fa";
import { convertToSlug } from "../../../../../utils/ProductUtil";
import type {
  Product,
  ProductVariant,
  VariantAttribute,
  VariantAttributeValue,
  VariantCombination,
} from "../models/product.model";

interface ProductInfoProps {
  product: Product;
  currentPrice?: number;
  discountPrice?: number;
  discount: number;
  selectedVariant: ProductVariant | null;
  handleVariantSelect: (variant: ProductVariant | null) => void;
  quantity: number;
  setQuantity: (q: number) => void;
  increaseQuantity: () => void;
  decreaseQuantity: () => void;
  addToCart: () => void;
  buyNow: () => void;
  formatPrice: (price?: number) => string;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  currentPrice,
  discountPrice,
  discount,
  selectedVariant,
  handleVariantSelect,
  quantity,
  setQuantity,
  increaseQuantity,
  decreaseQuantity,
  addToCart,
  buyNow,
  formatPrice,
}) => {
  const [showMobileVariantPopup, setShowMobileVariantPopup] = useState(false);
  const [actionType, setActionType] = useState<'cart' | 'buy' | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMobileAction = (type: 'cart' | 'buy') => {
    if (product.variantAttributes && product.variantAttributes.length > 0) {
      setActionType(type);
      setShowMobileVariantPopup(true);
    } else {
      if (type === 'cart') {
        addToCart();
      } else {
        buyNow();
      }
    }
  };

  const handleMobileVariantSelect = (variant: ProductVariant | null) => {
    handleVariantSelect(variant);
  };

  // Sử dụng giá được truyền từ parent component thay vì tự tính toán
  const displayPrice = discountPrice !== undefined && discountPrice > 0 ? discountPrice : currentPrice;
  const originalPrice = currentPrice;

  // Đảm bảo giá trị không bị undefined
  const finalDisplayPrice = displayPrice || 0;
  const finalOriginalPrice = originalPrice || 0;

  // Kiểm tra xem một giá trị có được chọn trong biến thể hiện tại không
  const isValueSelected = (attributeName: string, value: string) => {
    return selectedVariant?.combination?.some(
      (comb: VariantCombination) =>
        comb.attributeName === attributeName && comb.value === value
    );
  };

  // Tìm biến thể phù hợp với sự kết hợp mới
  const findMatchingVariant = (attributeName: string, value: string) => {
    if (!product.variants) return null;

    // Tạo combination mới từ selection hiện tại
    let newCombination: VariantCombination[] = [];

    if (selectedVariant) {
      // Nếu đã có variant được chọn, cập nhật giá trị mới
      newCombination = selectedVariant.combination.map((comb) =>
        comb.attributeName === attributeName ? { ...comb, value } : comb
      );
    } else {
      // Nếu chưa có variant được chọn, tạo mới với giá trị đầu tiên
      newCombination = [{ attributeName, value }];

      // Tự động chọn giá trị đầu tiên cho các thuộc tính còn lại
      product.variantAttributes?.forEach((attr) => {
        if (attr.name !== attributeName) {
          const firstAvailableValue = attr.values[0]?.value;
          if (firstAvailableValue) {
            newCombination.push({
              attributeName: attr.name,
              value: firstAvailableValue,
            });
          }
        }
      });
    }

    // Tìm variant phù hợp với combination mới
    const matchingVariant = product.variants.find(
      (variant) =>
        variant.combination.length === newCombination.length &&
        variant.combination.every((comb) =>
          newCombination.some(
            (newComb) =>
              newComb.attributeName === comb.attributeName &&
              newComb.value === comb.value
          )
        )
    );

    return matchingVariant || null;
  };

  // Determine if discount should be shown
  const shouldShowDiscount =
    discount > 0 &&
    finalDisplayPrice > 0 &&
    finalOriginalPrice > 0 &&
    finalDisplayPrice !== finalOriginalPrice;

  return (
    <div className="px-4 space-y-6">
      <h1 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">
        {product.name}
      </h1>
      {selectedVariant?.sku && (
        <p className="text-gray-500 mb-4">
          Mã sản phẩm: <span>{selectedVariant.sku}</span>
        </p>
      )}
      <div className="mb-6">
        {shouldShowDiscount ? (
          <div className="border-dashed border-2 border-gray-300 bg-[#f7f5e9dc] rounded-lg p-3 transition-all duration-300 shadow hover:shadow-md">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1">
                <span className="text-xl text-blue-900 font-bold">
                  {formatPrice(finalDisplayPrice)}
                </span>
                <span className="text-base text-gray-500 line-through ml-3">
                  {formatPrice(finalOriginalPrice)}
                </span>
              </div>
              <div className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-bold">
                GIẢM {discount}%
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Tiết kiệm:{" "}
              <span className="font-medium text-red-600">
                {formatPrice(finalOriginalPrice - finalDisplayPrice)}
              </span>
            </div>
          </div>
        ) : (
          <div className="border-dashed border-2 border-gray-300 bg-[#f7f5e9dc] rounded-lg p-3 transition-all duration-300 shadow hover:shadow-md">
            <span className="text-xl text-[#b99f08] font-bold">
              {formatPrice(finalDisplayPrice)}
            </span>
            {(finalDisplayPrice === 0 || finalDisplayPrice === undefined) && (
              <p className="mt-2 text-sm text-gray-600">
                Vui lòng liên hệ để biết thêm chi tiết về giá
              </p>
            )}
          </div>
        )}
        {product.variantAttributes && product.variantAttributes.length > 0 && !isMobile && (
          <div className="hidden md:flex flex-col gap-4 mt-4">
            {product.variantAttributes.map(
              (attribute: VariantAttribute, attrIndex: number) => (
                <div
                  key={attrIndex}
                  className="flex flex-row items-start gap-x-4 gap-y-2"
                >
                  <span className="text-base mr-2 min-w-[90px] text-gray-500 pt-2 whitespace-nowrap">
                    {attribute.name}
                  </span>
                  <div
                    className="flex flex-row flex-wrap gap-2 max-h-[315px] overflow-y-auto pr-1 custom-scrollbar"
                    style={{
                      minWidth: 0,
                    }}
                  >
                    {attribute.values.map(
                      (value: VariantAttributeValue, valueIndex: number) => {
                        const isSelected = isValueSelected(
                          attribute.name,
                          value.value
                        );
                        return (
                          <button
                            key={valueIndex}
                            className={`px-4 py-2 border rounded-lg text-sm transition-all duration-200 whitespace-nowrap
                              ${isSelected
                                ? "border-[#c0a83d] bg-[#b99f08] text-white"
                                : "border-[#c0a83d] hover:border-[#c0a83d] hover:bg-[#c0a83d] hover:text-white mt-1"
                              }`}
                            onClick={() => {
                              const matchingVariant = findMatchingVariant(
                                attribute.name,
                                value.value
                              );
                              handleVariantSelect(matchingVariant || null);
                            }}
                          >
                            {value.value}
                            {(value.additionalPrice || 0) > 0 && (
                              <span className="ml-1 text-sm text-gray-500">
                                (+{formatPrice(value.additionalPrice)})
                              </span>
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
        
        {/* Mobile Variant Popup */}
        {showMobileVariantPopup && (
          <>
            <div 
              className="fixed inset-0 bg-black/40 z-40 md:hidden" 
              onClick={() => setShowMobileVariantPopup(false)}
            />
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[60] md:hidden max-h-[70vh] overflow-y-auto pb-[84px]"> {/* Add padding bottom for floating controls */}
              <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={selectedVariant?.variantThumbnail || product.thumbnail || ''} 
                    alt={product.name} 
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatPrice(finalDisplayPrice)}{" "}
                      {shouldShowDiscount && (
                        <span className="font-medium text-sm text-gray-400 line-through ml-2">
                          {formatPrice(finalOriginalPrice)}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">Đã chọn: {selectedVariant?.variantName || 'Chưa chọn'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowMobileVariantPopup(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <FaTimes className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-4 space-y-4 mb-6">
                {product.variantAttributes?.map((attribute: VariantAttribute, attrIndex: number) => (
                  <div key={attrIndex} className="space-y-2">
                    <span className="text-sm font-medium text-gray-700">
                      {attribute.name}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {attribute.values.map((value: VariantAttributeValue, valueIndex: number) => {
                        const isSelected = isValueSelected(attribute.name, value.value);
                        return (
                          <button
                            key={valueIndex}
                            className={`px-4 py-2 border rounded-lg text-sm transition-all duration-200 whitespace-nowrap
                              ${isSelected
                                ? "border-[#c0a83d] bg-[#b99f08] text-white"
                                : "border-[#c0a83d] hover:border-[#c0a83d] hover:bg-[#c0a83d] hover:text-white"
                              }`}
                            onClick={() => {
                              const matchingVariant = findMatchingVariant(
                                attribute.name,
                                value.value
                              );
                              handleMobileVariantSelect(matchingVariant);
                            }}
                          >
                            {value.value}
                            {(value.additionalPrice || 0) > 0 && (
                              <span className="ml-1 text-sm text-gray-500">
                                (+{formatPrice(value.additionalPrice)})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Floating quantity and action bar */}
              <div className="fixed bottom-0 right-0 left-0 z-[60] md:hidden bg-white border-t flex flex-col sm:flex-row items-stretch px-4 py-3 gap-2">
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <span className="text-sm font-medium text-gray-700">Số lượng:</span>
                  <div className="flex items-center gap-2">
                    <button
                      className={`border border-gray-300 h-8 w-8 flex items-center justify-center rounded-lg ${quantity <= 1 ? "cursor-not-allowed" : "hover:bg-gray-100"}`}
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                    >
                      <FaMinus className={`${quantity <= 1 ? "opacity-50" : ""} text-gray-600 text-xs`} />
                    </button>
                    <input
                      type="text"
                      className="h-8 w-16 border border-gray-300 text-center rounded-lg text-sm"
                      value={quantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^[1-9]\d*$/.test(value) || value === "") {
                          const newQuantity = value === "" ? 1 : Number.parseInt(value);
                          setQuantity(newQuantity);
                        }
                      }}
                      onBlur={() => {
                        if (quantity < 1) setQuantity(1);
                      }}
                    />
                    <button
                      className="border border-gray-300 h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                      onClick={increaseQuantity}
                    >
                      <FaPlus className="text-gray-600 text-xs" />
                    </button>
                  </div>
                </div>
                <button
                  className={`w-full sm:w-auto py-3 px-6 transition-all duration-300 rounded-xl font-semibold shadow-md text-sm mt-2 sm:mt-0 ${
                    !selectedVariant 
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-[#c0a83d] to-[#b99f08] text-white hover:from-[#b99f08] hover:to-[#c0a83d]"
                  }`}
                  onClick={() => {
                    if (!selectedVariant) return;
                    if (actionType === 'cart') {
                      addToCart();
                    } else {
                      buyNow();
                    }
                    setShowMobileVariantPopup(false);
                  }}
                >
                  {!selectedVariant 
                    ? "Vui lòng chọn phân loại" 
                    : actionType === 'cart' 
                      ? 'Thêm vào giỏ hàng' 
                      : 'Mua ngay'}
                </button>
              </div>
            </div>
          </>
        )}
        
        <style jsx>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #b3b3b3 #f5f5fa;
            scrollbar-gutter: stable;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 10px;
            height: 10px;
            background: #f5f5fa;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #b3b3b3;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #888;
          }
        `}</style>
        <div
          className="text-gray-800 mb-6 p-4 pb-2 bg-gray-50 mt-4"
          dangerouslySetInnerHTML={{
            __html:
              product?.shortDescription || product?.description
                ? (product?.shortDescription || product?.description || "")
                  .replace(/src="([^"]+)"/g, (match: string, src: string) =>
                    src.startsWith("http")
                      ? match
                      : `src="${process.env.NEXT_PUBLIC_API_URL}${src}"`
                  )
                  .replace(
                    /data-src="([^"]+)"/g,
                    (match: string, src: string) =>
                      src.startsWith("http")
                        ? match
                        : `data-src="${process.env.NEXT_PUBLIC_API_URL}${src}"`
                  )
                  .replace(
                    /data-srcset="([^"]+)"/g,
                    (match: string, srcset: string) => {
                      if (srcset.includes("http")) return match;
                      const newSrcset = srcset
                        .split(",")
                        .map(
                          (s: string) =>
                            `${process.env.NEXT_PUBLIC_API_URL}${s.trim()}`
                        )
                        .join(", ");
                      return `data-srcset="${newSrcset}"`;
                    }
                  )
                  .replace(/<p>&nbsp;<\/p>/g, "")
                : "",
          }}
          itemProp="description"
        />
        {selectedVariant && (
          <div className="hidden mt-4 space-y-2 md:block">
            <p className="text-sm text-gray-600">
              Loại sản phẩm đã chọn:{" "}
              <span className="font-medium">{selectedVariant.variantName}</span>
            </p>
          </div>
        )}
      </div>

      <div className="hidden mb-6 md:block">
        <div className="flex items-center gap-4">
          <label htmlFor="quantity" className="text-lg font-semibold mb-0">
            Số lượng:
          </label>
          <div className="flex items-center gap-2">
            <button
              className={`border border-gray-300 h-10 w-10 flex items-center justify-center rounded-lg ${quantity <= 1 ? "cursor-not-allowed" : "hover:bg-gray-100"
                }`}
              onClick={decreaseQuantity}
              disabled={quantity <= 1}
              aria-label="Giảm số lượng"
            >
              <FaMinus
                className={`${quantity <= 1 ? "opacity-50" : ""} text-gray-600`}
              />
            </button>
            <input
              id="quantity"
              type="text"
              className="h-10 w-16 border-t border-b border-gray-300 text-center rounded-none"
              value={quantity}
              onChange={(e) => {
                const value = e.target.value;
                if (/^[1-9]\d*$/.test(value) || value === "") {
                  const newQuantity = value === "" ? 1 : Number.parseInt(value);
                  setQuantity(newQuantity);
                }
              }}
              onBlur={() => {
                if (quantity < 1) setQuantity(1);
              }}
              aria-label="Số lượng sản phẩm"
            />
            <button
              className={`border border-gray-300 h-10 w-10 flex items-center justify-center rounded-lg hover:bg-gray-100`}
              onClick={increaseQuantity}
              aria-label="Tăng số lượng"
            >
              <FaPlus className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
      {/* Desktop buttons */}
      <div className="hidden md:flex flex-col sm:flex-row gap-4 mb-8">
        <button
          className={`py-3 px-6 bg-white border border-[#b99f08] text-[#b99f08] hover:bg-[#f7f5e9dc] flex items-center justify-center gap-2 flex-1 rounded-lg font-semibold shadow text-sm`}
          onClick={addToCart}
          aria-label="Thêm vào giỏ hàng"
        >
          <FaShoppingCart />
          <span>Thêm vào giỏ hàng</span>
        </button>
        <button
          className="py-3 px-6 bg-gradient-to-r from-[#c0a83d] to-[#b99f08] text-white hover:from-[#b99f08] hover:to-[#c0a83d] transition-all duration-300 flex-1 rounded-xl font-semibold shadow-md text-sm"
          onClick={buyNow}
          aria-label="Mua ngay"
        >
          Mua ngay
        </button>
      </div>

      {/* Mobile fixed bottom buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex gap-2 md:hidden z-50">
        <button
          className={`py-3 flex-1 bg-white border border-[#b99f08] text-[#b99f08] flex items-center justify-center gap-2 rounded-lg font-semibold shadow-sm text-sm`}
          onClick={() => handleMobileAction('cart')}
          aria-label="Thêm vào giỏ hàng"
        >
          <FaShoppingCart />
          <span>Thêm vào giỏ hàng</span>
        </button>
        <button
          className="py-3 flex-1 bg-gradient-to-r from-[#c0a83d] to-[#b99f08] text-white transition-all duration-300 rounded-xl font-semibold shadow-md text-sm"
          onClick={() => handleMobileAction('buy')}
          aria-label="Mua ngay"
        >
          Mua ngay
        </button>
      </div>
      <div className="bg-gray-50 px-4 pt-3 pb-1 border-l-4 border-[#b99f08] rounded-xl shadow-sm">
        <p className="font-  text-gray-800">
          <strong>Mua hàng tại Décor & More - tích điểm nhận xu ngay</strong>
        </p>
      </div>

      <div className="mt-6 space-y-1">
        {product.category && product.category.main && (
          <p className="text-gray-600">
            <span className="font-semibold">Danh mục:</span>{" "}
            <Link
              href={`/category/${convertToSlug(product.category.main)}`}
              className="text-blue-900 no-underline hover:text-blue-700"
            >
              {product.category.main}
            </Link>
          </p>
        )}
        {product?.category?.sub && product?.category?.sub.length > 0 && (
          <p className="text-gray-600">
            <span className="font-semibold">Phân loại:</span>{" "}
            {product?.category?.sub.map(
              (subCategory: string, index: number) => (
                <React.Fragment key={subCategory}>
                  <Link
                    href={`/category/${convertToSlug(subCategory)}`}
                    className="text-blue-900 no-underline hover:text-blue-700"
                  >
                    {subCategory}
                  </Link>
                  {index < (product?.category?.sub?.length || 0) - 1
                    ? ", "
                    : ""}
                </React.Fragment>
              )
            )}
          </p>
        )}
        {product?.category?.tags && product?.category?.tags.length > 0 && (
          <p className="text-gray-600">
            <span className="font-semibold">Từ khóa:</span>{" "}
            {product?.category?.tags.map((tag: string, index: number) => (
              <React.Fragment key={tag}>
                <Link
                  href={`/tag/${convertToSlug(tag)}`}
                  className="text-blue-900 no-underline hover:text-blue-700"
                >
                  {tag}
                </Link>
                {index < (product?.category?.tags?.length || 0) - 1 ? ", " : ""}
              </React.Fragment>
            ))}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;
