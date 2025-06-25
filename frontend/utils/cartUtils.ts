/**
 * Interface định nghĩa cấu trúc một sản phẩm trong giỏ hàng
 */
export interface CartItem {
  _id: string;
  name: string;
  price: number;
  basePrice?: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  variant?: string;
  slug?: string;
  currentPrice?: number;
  discountPrice?: number;
  sku?: string;
  cartItemId?: string;
}

/**
 * Tạo ID duy nhất cho sản phẩm trong giỏ hàng
 * @returns string ID ngẫu nhiên
 */
const generateCartItemId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Lấy giỏ hàng từ localStorage
 * @returns Mảng các CartItem hoặc mảng rỗng nếu không có giỏ hàng
 */
export const getCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];

  const storedCart = localStorage.getItem('cart');
  if (!storedCart) return [];

  try {
    const parsedCart: any[] = JSON.parse(storedCart);

    // Chuẩn hóa dữ liệu để đảm bảo tương thích với CartItem interface
    const normalizedCart = parsedCart.map(item => ({
      _id: item._id || item.id || '', // 🔄 Hỗ trợ cả _id mới và id cũ
      name: item.name,
      // Đảm bảo giữ nguyên giá gốc
      currentPrice: item.currentPrice || 0,
      discountPrice: item.discountPrice,
      // Tính toán giá hiển thị
      price: item.discountPrice || item.currentPrice || 0,
      originalPrice: item.discountPrice ? item.currentPrice : undefined,
      quantity: item.quantity,
      image: item.image,
      variant: item.variant,
      slug: item.slug,
      sku: item.sku,
      // Đảm bảo mỗi sản phẩm có cartItemId duy nhất
      cartItemId: item.cartItemId || generateCartItemId()
    }));

    return normalizedCart;
  } catch (error) {
    console.error('Lỗi khi đọc giỏ hàng từ localStorage:', error);
    return [];
  }
};

/**
 * Lưu giỏ hàng vào localStorage và phát sự kiện để cập nhật các component khác
 * @param cart Mảng các CartItem cần lưu
 */
export const saveCart = (cart: CartItem[]): void => {
  if (typeof window === 'undefined') return;

  try {
    // Đảm bảo mỗi item đều có trường price được cập nhật chính xác
    const updatedCart = cart.map(item => ({
      ...item,
      price: item.discountPrice || item.currentPrice || 0
    }));

    localStorage.setItem('cart', JSON.stringify(updatedCart));

    // Phát sự kiện để thông báo rằng giỏ hàng đã thay đổi
    window.dispatchEvent(new Event('cart-updated'));
  } catch (error) {
    console.error('Lỗi khi lưu giỏ hàng vào localStorage:', error);
  }
};

/**
 * Đăng ký lắng nghe sự thay đổi giỏ hàng
 * @param callback Hàm xử lý khi giỏ hàng thay đổi
 * @returns Hàm để hủy đăng ký lắng nghe
 */
export const listenCartChange = (callback: () => void): () => void => {
  if (typeof window === 'undefined') return () => { };

  // 🔄 Lắng nghe sự kiện cart-updated từ các thao tác trên giỏ hàng
  const handleCartUpdated = () => {
    callback();
  };

  // 📱 Lắng nghe sự thay đổi localStorage (cho trường hợp nhiều tab)
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'cart') {
      callback();
    }
  };

  // 👁️ Lắng nghe khi tab được focus lại (trường hợp user quay lại tab)
  const handleFocus = () => {
    callback();
  };

  // Đăng ký các sự kiện
  window.addEventListener('cart-updated', handleCartUpdated);
  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('focus', handleFocus);

  // Trả về hàm để hủy đăng ký
  return () => {
    window.removeEventListener('cart-updated', handleCartUpdated);
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('focus', handleFocus);
  };
};

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param item Sản phẩm cần thêm vào giỏ hàng
 * @return Giỏ hàng mới sau khi thêm sản phẩm
 */
export const addToCart = (item: CartItem): CartItem[] => {
  // ⚠️ Kiểm tra ID hợp lệ trước khi thêm vào giỏ hàng
  if (!item._id) {
    console.error('🚫 Không thể thêm sản phẩm không có _id hợp lệ vào giỏ hàng');
    return getCart();
  }

  const cart = getCart();

  // 🔍 Kiểm tra sản phẩm đã tồn tại trong giỏ hàng chưa
  // Sử dụng cả _id, variant VÀ slug để xác định chính xác sản phẩm
  const existingItemIndex = cart.findIndex(cartItem =>
    cartItem._id === item._id &&
    cartItem.variant === item.variant &&
    cartItem.slug === item.slug
  );

  if (existingItemIndex !== -1) {
    // ⬆️ Nếu sản phẩm đã tồn tại, cập nhật số lượng và giữ nguyên các thông tin giá
    cart[existingItemIndex].quantity += item.quantity;
  } else {
    // ➕ Nếu sản phẩm chưa tồn tại, thêm vào giỏ hàng với cartItemId duy nhất
    cart.push({
      ...item,
      currentPrice: item.currentPrice || 0,
      discountPrice: item.discountPrice,
      price: item.discountPrice || item.currentPrice || 0,
      cartItemId: generateCartItemId()
    });
  }

  // 💾 Lưu giỏ hàng mới vào localStorage
  saveCart(cart);

  return cart;
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 * @param _id ID của sản phẩm cần cập nhật
 * @param quantity Số lượng mới
 * @param variant Biến thể của sản phẩm (nếu có)
 * @param slug Slug của sản phẩm để xác định chính xác
 * @returns Giỏ hàng mới sau khi cập nhật
 */
export const updateQuantity = (_id: string, quantity: number, variant?: string, slug?: string): CartItem[] => {
  if (quantity < 1) return getCart(); // Không cho phép số lượng nhỏ hơn 1

  const cart = getCart();

  const updatedCart = cart.map(item => {
    // Sử dụng cả _id, variant VÀ slug để xác định chính xác sản phẩm
    if (item._id === _id && item.variant === variant && (!slug || item.slug === slug)) {
      return {
        ...item,
        quantity,
        // Đảm bảo giá được tính lại khi cập nhật số lượng
        price: item.discountPrice || item.currentPrice || 0
      };
    }
    return item;
  });

  saveCart(updatedCart);

  return updatedCart;
};

/**
 * Xóa sản phẩm khỏi giỏ hàng
 * @param _id ID của sản phẩm cần xóa
 * @param variant Biến thể của sản phẩm (nếu có)
 * @param slug Slug của sản phẩm để xác định chính xác
 * @returns Giỏ hàng mới sau khi xóa sản phẩm
 */
// export const removeFromCart = (_id: string, variant?: string, slug?: string): CartItem[] => {
//   const cart = getCart();

//   // Sử dụng cả _id, variant VÀ slug để xác định chính xác sản phẩm
//   const updatedCart = cart.filter(item =>
//     !(item._id === _id && item.variant === variant && (!slug || item.slug === slug))
//   );

//   saveCart(updatedCart);

//   return updatedCart;
// };
/**
 * Xoá sản phẩm khỏi giỏ hàng dựa theo `cartItemId` (ưu tiên), hoặc `_id + variant + slug`
 */
export const removeFromCart = (
  _id: string,
  variant?: string,
  slug?: string,
  cartItemId?: string
): CartItem[] => {
  const cart = getCart();

  const updatedCart = cart.filter((item) => {
    // Nếu có cartItemId thì ưu tiên so sánh
    if (cartItemId) return item.cartItemId !== cartItemId;

    // Nếu không có thì fallback theo ID, variant và slug
    const sameId = item._id === _id;
    const sameVariant = variant ? item.variant === variant : true;
    const sameSlug = slug ? item.slug === slug : true;

    return !(sameId && sameVariant && sameSlug);
  });

  localStorage.setItem("cart", JSON.stringify(updatedCart));
  return updatedCart;
};


/**
 * Tính tổng tiền của giỏ hàng
 * @param cart Giỏ hàng cần tính tổng
 * @returns Tổng tiền của giỏ hàng
 */
export const getCartTotal = (cart: CartItem[]): number => {
  return cart.reduce((sum, item) => {
    // Đảm bảo sử dụng giá đã giảm (nếu có) hoặc giá gốc
    const itemPrice = item.discountPrice || item.currentPrice || 0;
    return sum + itemPrice * item.quantity;
  }, 0);
};

/**
 * Xóa toàn bộ giỏ hàng
 */
export const clearCart = (): void => {
  saveCart([]);
};

/**
 * Format giá tiền theo định dạng VND
 * @param price Số tiền cần format
 * @returns Chuỗi đã được format
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
    .format(price)
    .replace('₫', 'đ');
};