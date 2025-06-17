import React from "react";
import { IoCartOutline } from "react-icons/io5";
import Link from "next/link";

interface ProductCardShopeeStyleProps {
  slug: string;
  name: string;
  imageUrl: string;
  currentPrice?: number;
  discountPrice?: number;
  onAddToCart?: () => void;
}

const ProductCardShopeeStyle: React.FC<ProductCardShopeeStyleProps> = ({
  slug,
  name,
  imageUrl,
  currentPrice,
  discountPrice,
  onAddToCart,
}) => {
  const formatPrice = (price?: number): string => {
    if (!price || price <= 0) return "Liên hệ";
    return price.toLocaleString("vi-VN") + "₫";
  };

  const discountPercent =
    currentPrice && discountPrice && currentPrice > discountPrice
      ? Math.round(((currentPrice - discountPrice) / currentPrice) * 100)
      : 0;

  const isContact = !currentPrice || currentPrice <= 0;

  return (
    <article className="w-full border rounded-md bg-white hover:shadow-md transition p-2 text-sm">
      <Link href={`/san-pham/${slug}`} className="block">
        <div className="relative">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-44 object-contain mb-2"
          />
          {/* {hasFreeShipping && (
            <img
              src="/freeship-xtra.png"
              alt="Freeship Xtra"
              className="absolute top-1 left-1 w-14"
            />
          )}
          {isOfficial && (
            <img
              src="/chinh-hang-badge.png"
              alt="Chính Hãng"
              className="absolute top-1 left-16 w-14"
            />
          )} */}
        </div>

        <h3 className="line-clamp-2 min-h-[2.5rem] font-medium text-gray-800">
          {discountPercent > 0 && (
              <span className="text-xs bg-gray-100 text-red-500 p-[3px] rounded-md font-semibold mr-1">-{discountPercent}%</span>
          )}
          <span className="text-gray-800 font-medium">{name}</span>
        </h3>



        {/* <div className="flex items-center text-yellow-500 my-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i}>★</span>
          ))}
        </div> */}

        <div className="flex items-center space-x-2 mb-1">
          <span className="text-red-600 font-bold text-base">
            {formatPrice(discountPrice)}
          </span>
          {discountPercent > 0 && (
            <span className="text-gray-400 text-sm line-through">
              {formatPrice(currentPrice)}
            </span>
          )}
        </div>

        {/* {discountPercent > 0 && (
          <div className="text-xs text-red-500 font-semibold mb-1">
            -{discountPercent}%
          </div>
        )} */}

        {/* {origin && <p className="text-xs text-gray-500">Made in {origin}</p>}
        {deliveryDate && (
          <p className="text-xs text-gray-500 mt-1">Giao {deliveryDate}</p>
        )} */}
      </Link>

      {!isContact && (
        <button
          onClick={onAddToCart}
          className="w-full mt-2 flex items-center justify-center bg-blue-400 hover:bg-blue-500 text-white py-1 rounded-md transition"
        >
          <IoCartOutline className="mr-2" />
          Thêm vào giỏ
        </button>
      )}
    </article>
  );
};

export default ProductCardShopeeStyle;
