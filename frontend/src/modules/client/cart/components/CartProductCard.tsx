import { CartItem } from '../../../../../utils/cartUtils';
import CartProductCardItem from './CartProductCardItem';
import { FC } from 'react';

type CartProductCardProps = {
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

const CartProductCard: FC<CartProductCardProps> = ({
  cartItems,
  handleQuantityChange,
  handleRemoveItem,
  formatPrice,
}) => {
  return (
    <div className="md:hidden space-y-4">
      {cartItems.map((item) => (
        <CartProductCardItem
          key={item.cartItemId || `${item._id}-${item.variant || ''}-${item.slug || ''}-mobile`}
          item={item}
          handleQuantityChange={handleQuantityChange}
          handleRemoveItem={handleRemoveItem}
          formatPrice={formatPrice}
        />
      ))}
    </div>
  );
};

export default CartProductCard;