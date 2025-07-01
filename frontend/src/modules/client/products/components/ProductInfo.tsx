import React from "react";
import Link from "next/link";
import { FaShoppingCart, FaMinus, FaPlus } from "react-icons/fa";
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
  // Tính tổng giá tăng thêm từ các thuộc tính được chọn
  const calculateAdditionalPrice = () => {
    if (!selectedVariant || !product.variantAttributes) return 0;

    let totalAdditional = 0;
    selectedVariant.combination.forEach((comb) => {
      const attribute = product.variantAttributes?.find(
        (attr) => attr.name === comb.attributeName
      );
      const value = attribute?.values.find((val) => val.value === comb.value);
      if (value?.additionalPrice) {
        totalAdditional += value.additionalPrice;
      }
    });
    return totalAdditional;
  };

  // Xác định giá hiển thị dựa trên biến thể được chọn và props
  const additionalPrice = calculateAdditionalPrice();

  // Tính giá hiển thị dựa trên việc có variant hay không
  const baseDisplayPrice = product.hasVariants
    ? selectedVariant
      ? (product.basePrice || 0) + additionalPrice // Có variant -> basePrice + additionalPrice
      : product.basePrice || 0 // Chưa chọn variant -> basePrice
    : product.currentPrice || product.basePrice || 0; // Không có variant -> currentPrice

  const displayPrice = baseDisplayPrice;

  // Xác định giá giảm dựa trên việc có variant hay không
  const displayDiscountPrice = product.hasVariants
    ? undefined // Có variant -> không có giá giảm
    : product.discountPrice; // Không có variant -> lấy giá giảm từ sản phẩm

  // Tính toán phần trăm giảm giá
  const calculatedDiscount =
    displayDiscountPrice && displayPrice
      ? Math.round(((displayPrice - displayDiscountPrice) / displayPrice) * 100)
      : 0;

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
        {calculatedDiscount > 0 ? (
          <div className="border-dashed border-2 border-gray-300 bg-blue-50 rounded-lg p-3 transition-all duration-300 shadow hover:shadow-md">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1">
                <span className="text-xl text-blue-900 font-bold">
                  {formatPrice(displayDiscountPrice)}
                </span>
                <span className="text-base text-gray-500 line-through ml-3">
                  {formatPrice(displayPrice)}
                </span>
              </div>
              <div className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-bold">
                GIẢM {calculatedDiscount}%
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Tiết kiệm:{" "}
              <span className="font-medium text-red-600">
                {formatPrice(displayPrice - (displayDiscountPrice || 0))}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 rounded-lg p-6 transition-all duration-300 shadow hover:shadow-md">
            <span className="text-xl text-blue-900 font-bold">
              {formatPrice(displayPrice)}
            </span>
            {displayPrice === 0 && (
              <p className="mt-2 text-sm text-gray-600">
                Vui lòng liên hệ để biết thêm chi tiết về giá
              </p>
            )}
          </div>
        )}
        <div
          className="text-gray-800 mb-6 p-4 pb-2 bg-gray-50"
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
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600">
              Loại sản phẩm đã chọn:{" "}
              <span className="font-medium">{selectedVariant.variantName}</span>
            </p>
            {selectedVariant.variantStock !== undefined && (
              <p className="text-sm text-gray-600">
                Số lượng còn lại:{" "}
                <span className="font-medium">
                  {selectedVariant.variantStock}
                </span>
              </p>
            )}
          </div>
        )}
      </div>
      {product.variantAttributes && product.variantAttributes.length > 0 && (
        <div className="space-y-4">
          {product.variantAttributes.map(
            (attribute: VariantAttribute, attrIndex: number) => (
              <div key={attrIndex} className="mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  {attribute.name}:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {attribute.values.map(
                    (value: VariantAttributeValue, valueIndex: number) => {
                      const isSelected = isValueSelected(
                        attribute.name,
                        value.value
                      );
                      return (
                        <button
                          key={valueIndex}
                          className={`px-4 py-2 border rounded-lg font-medium transition-all duration-200
                        ${
                          isSelected
                            ? "border-blue-900 bg-blue-50 text-blue-900 shadow"
                            : "border-gray-300 hover:border-blue-900 hover:bg-blue-50"
                        } ${
                            findMatchingVariant(attribute.name, value.value)
                              ?.variantStock === 0
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() => {
                            const matchingVariant = findMatchingVariant(
                              attribute.name,
                              value.value
                            );
                            if (matchingVariant?.variantStock === 0) return;
                            handleVariantSelect(matchingVariant || null);
                          }}
                          disabled={
                            findMatchingVariant(attribute.name, value.value)
                              ?.variantStock === 0
                          }
                        >
                          {value.value}
                          {(value.additionalPrice || 0) > 0 && (
                            <span className="ml-1 text-sm text-gray-500">
                              (+{formatPrice(value.additionalPrice)})
                            </span>
                          )}
                          {findMatchingVariant(attribute.name, value.value)
                            ?.variantStock === 0 && (
                            <span className="ml-1 text-sm text-red-500">
                              (Hết hàng)
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
      <div className="mb-6">
        <label htmlFor="quantity" className="block text-lg font-semibold mb-2">
          Số lượng:
        </label>
        <div className="flex items-center gap-2">
          <button
            className={`border border-gray-300 h-10 w-10 flex items-center justify-center rounded-lg ${
              quantity <= 1 ? "cursor-not-allowed" : "hover:bg-gray-100"
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
                if (selectedVariant?.variantStock !== undefined) {
                  setQuantity(
                    Math.min(newQuantity, selectedVariant.variantStock)
                  );
                } else {
                  setQuantity(newQuantity);
                }
              }
            }}
            onBlur={() => {
              if (quantity < 1) setQuantity(1);
            }}
            aria-label="Số lượng sản phẩm"
          />
          <button
            className={`border border-gray-300 h-10 w-10 flex items-center justify-center rounded-lg ${
              selectedVariant?.variantStock !== undefined &&
              quantity >= selectedVariant.variantStock
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-gray-100"
            }`}
            onClick={increaseQuantity}
            disabled={
              selectedVariant?.variantStock !== undefined &&
              quantity >= selectedVariant.variantStock
            }
            aria-label="Tăng số lượng"
          >
            <FaPlus className="text-gray-600" />
          </button>
        </div>
        {selectedVariant?.variantStock !== undefined &&
          selectedVariant.variantStock <= 5 && (
            <p className="text-sm text-red-600 mt-2">
              Chỉ còn {selectedVariant.variantStock} sản phẩm
            </p>
          )}
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          className={`py-3 px-6 bg-white border border-blue-900 text-blue-900 hover:bg-blue-50 flex items-center justify-center gap-2 flex-1 rounded-lg font-semibold shadow text-sm ${
            selectedVariant?.variantStock === 0
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          onClick={addToCart}
          disabled={selectedVariant?.variantStock === 0}
          aria-label="Thêm vào giỏ hàng"
        >
          <FaShoppingCart />
          <span>Thêm vào giỏ hàng</span>
        </button>
        <button
          className={`py-3 px-6 bg-blue-900 text-white hover:bg-blue-800 flex-1 rounded-lg font-semibold shadow text-sm ${
            selectedVariant?.variantStock === 0
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          onClick={buyNow}
          disabled={selectedVariant?.variantStock === 0}
          aria-label="Mua ngay"
        >
          Mua ngay
        </button>
      </div>
      <div className="bg-gray-50 px-4 pt-3 pb-1 border-l-4 border-blue-900 rounded-lg">
        <p className="font-bold text-gray-800">
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
