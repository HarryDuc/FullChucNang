import Link from "next/link";

interface OrderSuccessProps {
  orderSlug: string;
}

const OrderSuccess = ({ orderSlug }: OrderSuccessProps) => {
  return (
    <div className="checkout-page">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white border p-8 text-center">
          <div className="text-green-600 inline-block p-6 mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-24 w-24"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-medium mb-4 text-gray-800">
            ĐẶT HÀNG THÀNH CÔNG
          </h2>
          <p className="text-gray-600 mb-6">
            Cảm ơn quý khách đã đặt hàng tại Decor & More. Đơn hàng của quý
            khách đã được tiếp nhận và đang được xử lý. Mã đơn hàng của quý
            khách là:{" "}
            <span className="font-medium text-blue-900">{orderSlug}</span>
          </p>
          <p className="text-gray-600 mb-8">
            Chúng tôi sẽ liên hệ với quý khách trong thời gian sớm nhất để xác
            nhận đơn hàng.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-block bg-blue-900 text-white px-8 py-3 no-underline hover:bg-blue-800 transition duration-300"
            >
              TIẾP TỤC MUA SẮM
            </Link>
            <Link
              href="/account"
              className="inline-block border border-blue-900 text-blue-900 px-8 py-3 no-underline hover:bg-blue-50 transition duration-300"
            >
              XEM ĐƠN HÀNG
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
