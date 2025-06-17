import { FC } from 'react';

type CartCouponProps = {
  couponCode: string;
  setCouponCode: (code: string) => void;
  handleApplyCoupon: () => void;
  couponMessage: string;
  couponValid: boolean | null;
};

const CartCoupon: FC<CartCouponProps> = ({
  couponCode,
  setCouponCode,
  handleApplyCoupon,
  couponMessage,
  couponValid,
}) => (
  <div className="flex justify-end">
    <div className="w-full md:w-auto">
      <div className="flex">
        <input
          type="text"
          placeholder="Nhập mã giảm giá DECOR10"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className={`border p-2 min-w-0 flex-1 md:w-52 lg:w-64 focus:outline-none rounded-l ${couponValid === true
              ? 'border-green-500 focus:border-green-600'
              : couponValid === false
                ? 'border-red-500 focus:border-red-600'
                : 'border-gray-300 focus:border-blue-500'
            }`}
          aria-label="Nhập mã giảm giá"
        />
        <button
          onClick={handleApplyCoupon}
          className="bg-blue-900 text-white px-3 md:px-4 py-2 hover:bg-blue-800 transition duration-300 rounded-r whitespace-nowrap min-w-[80px]"
          tabIndex={0}
          aria-label="Áp dụng mã giảm giá"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleApplyCoupon();
            }
          }}
        >
          Áp dụng
        </button>
      </div>
      {couponMessage && (
        <div
          className={`mt-1 text-sm ${couponValid === true
              ? 'text-green-600'
              : couponValid === false
                ? 'text-red-600'
                : 'text-gray-600'
            }`}
        >
          {couponMessage}
        </div>
      )}
    </div>
  </div>
);

export default CartCoupon;