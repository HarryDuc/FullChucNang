import Link from 'next/link';

const CartEmpty = () => (
  <div className="bg-white border rounded-md py-8 md:py-12 px-4 text-center">
    <div className="text-blue-900 inline-block p-4 md:p-6 mb-4 md:mb-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 md:h-24 w-16 md:w-24"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    </div>
    <h2 className="text-lg md:text-xl font-medium mb-6 text-gray-800">
      CHƯA CÓ SẢN PHẨM TRONG GIỎ HÀNG
    </h2>
    <Link
      href="/category"
      className="inline-block bg-blue-900 text-white px-6 md:px-8 py-2.5 md:py-3 rounded hover:bg-blue-800 transition duration-300 no-underline"
      tabIndex={0}
      aria-label="Quay lại cửa hàng"
    >
      QUAY LẠI CỬA HÀNG
    </Link>
  </div>
);

export default CartEmpty;