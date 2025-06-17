import Link from 'next/link';
import { CartItem } from '../../../../../utils/cartUtils';
import { FC } from 'react';

type CartProductCardItemProps = {
  item: CartItem;
  handleQuantityChange: (
    _id: string,
    newQuantity: number,
    variant?: string,
    slug?: string
  ) => void;
  handleRemoveItem: (
    _id: string,
    variant?: string,
    slug?: string,
    cartItemId?: string
  ) => void;
  formatPrice: (price: number) => string;
};

const CartProductCardItem: FC<CartProductCardItemProps> = ({
  item,
  handleQuantityChange,
  handleRemoveItem,
  formatPrice,
}) => {
  return (
    <div className="bg-white border rounded-md p-4">
      <div className="flex space-x-4">
        <div className="w-[60px] h-[60px] bg-gray-100 border relative">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex-1">
          <Link
            href={`/product/${item.slug}`}
            className="no-underline hover:underline"
            tabIndex={0}
            aria-label={`Xem chi tiết sản phẩm ${item.name}`}
          >
            <div className="font-medium text-gray-800">{item.name}</div>
          </Link>
          {item.variant && (
            <div className="text-sm text-gray-600 mt-1">Phiên bản: {item.variant}</div>
          )}
          <div className="flex items-center mt-1">
            <div className="text-blue-900 font-medium mr-2">
              {formatPrice(item.discountPrice || item.currentPrice || 0)}
            </div>
            {item.discountPrice && item.currentPrice && (
              <div className="text-gray-500 line-through text-sm">
                {formatPrice(item.currentPrice)}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center border border-gray-300 rounded w-fit">
          <button
            onClick={() => handleQuantityChange(item._id, item.quantity - 1, item.variant, item.slug)}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
            tabIndex={0}
            aria-label={`Giảm số lượng sản phẩm ${item.name}`}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && item.quantity > 1) {
                handleQuantityChange(item._id, item.quantity - 1, item.variant, item.slug);
              }
            }}
          >
            -
          </button>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1, item.variant, item.slug)}
            className="border-x border-gray-300 w-10 h-8 text-center appearance-none"
            min="1"
            aria-label={`Số lượng sản phẩm ${item.name}`}
          />
          <button
            onClick={() => handleQuantityChange(item._id, item.quantity + 1, item.variant, item.slug)}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
            tabIndex={0}
            aria-label={`Tăng số lượng sản phẩm ${item.name}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleQuantityChange(item._id, item.quantity + 1, item.variant, item.slug);
              }
            }}
          >
            +
          </button>
        </div>
        <button
          onClick={() => handleRemoveItem(item._id, item.variant, item.slug, item.cartItemId)}
          className="text-gray-500 hover:text-red-600 flex items-center"
          tabIndex={0}
          aria-label={`Xóa sản phẩm ${item.name}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleRemoveItem(item._id, item.variant, item.slug, item.cartItemId);
            }
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Xóa
        </button>
      </div>
      <div className="mt-3 pt-3 border-t flex justify-between items-center">
        <div className="text-gray-600">Thành tiền:</div>
        <div className="font-medium text-blue-900">
          {formatPrice((item.discountPrice || item.currentPrice || 0) * item.quantity)}
        </div>
      </div>
    </div>
  );
};

export default CartProductCardItem;