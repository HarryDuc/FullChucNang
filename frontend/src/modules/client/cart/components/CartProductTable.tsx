import { CartItem } from '../../../../../utils/cartUtils';
import CartProductRow from './CartProductRow';
import { FC } from 'react';

type CartProductTableProps = {
  cartItems: CartItem[];
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

const CartProductTable: FC<CartProductTableProps> = ({
  cartItems,
  handleQuantityChange,
  handleRemoveItem,
  formatPrice,
}) => {
  return (
    <div className="hidden md:block bg-white border rounded-md mb-8">
      <div className="border-b py-3 px-4 md:px-6 flex font-medium text-gray-700 bg-gray-50 rounded-t-md">
        <div className="w-1/2">Sản phẩm</div>
        <div className="w-1/6 text-center">Đơn giá</div>
        <div className="w-1/6 text-center">Số lượng</div>
        <div className="w-1/6 text-center">Thành tiền</div>
      </div>
      {cartItems.map((item) => (
        <CartProductRow
          key={item.cartItemId || `${item._id}-${item.variant || ''}-${item.slug || ''}`}
          item={item}
          handleQuantityChange={handleQuantityChange}
          handleRemoveItem={handleRemoveItem}
          formatPrice={formatPrice}
        />
      ))}
    </div>
  );
};

export default CartProductTable;