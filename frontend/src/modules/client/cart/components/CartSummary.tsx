import Link from 'next/link';
import { CartItem } from '../../../../../utils/cartUtils';
import { FC } from 'react';

type CartSummaryProps = {
  cartItems: CartItem[];
  getSubtotal: () => number;
  getTotal: () => number;
  formatPrice: (price: number) => string;
};

const CartSummary: FC<CartSummaryProps> = ({
  cartItems,
  getSubtotal,
  getTotal,
  formatPrice,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-md lg:sticky lg:top-4">
      <div className="border-b py-3 px-4 md:px-6 font-medium text-base md:text-lg bg-gray-50 rounded-t-md">
        THÔNG TIN ĐƠN HÀNG
      </div>
      <div className="p-4 md:p-6">
        <div className="flex justify-between py-3 border-b border-gray-100">
          <span className="text-gray-600">Tạm tính ({cartItems.length} sản phẩm)</span>
          <span className="font-medium">{formatPrice(getSubtotal())}</span>
        </div>
        <div className="flex justify-between py-4 font-medium text-base md:text-lg">
          <span>Tổng cộng</span>
          <span className="text-blue-900">{formatPrice(getTotal())}</span>
        </div>
        <div className="mt-4 md:mt-6 space-y-4">
          <Link
            href="/checkout"
            className="block bg-blue-900 no-underline text-white text-center py-3 hover:bg-blue-800 transition duration-300 font-medium rounded"
            tabIndex={0}
            aria-label="Tiến hành thanh toán"
          >
            TIẾN HÀNH THANH TOÁN
          </Link>
          <div className="text-sm text-gray-500 mt-4">
            <p className="flex items-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Miễn phí giao hàng toàn quốc
            </p>
            <p className="flex items-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Đổi trả miễn phí trong 7 ngày
            </p>
            <p className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Thanh toán bảo mật
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;