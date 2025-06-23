import React from "react";
import Link from "next/link";
import { CartItem } from "../../../../../utils/cartUtils";
import { formatPrice } from "../../../../../utils/cartUtils";
import VoucherInput from "../../voucher/components/VoucherInput";

interface OrderSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  isSubmitting: boolean;
  shippingInfo?: {
    fullName: string;
    phone: string;
    address: string;
    locationNames: {
      wardName: string;
      districtName: string;
      provinceName: string;
    };
  };
  onSubmit: (e: React.FormEvent) => void;
  getSubtotal: () => number;
  paymentMethod: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  cartItems,
  subtotal,
  shippingFee,
  discountAmount,
  isSubmitting,
  shippingInfo,
  onSubmit,
  getSubtotal,
  paymentMethod,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Tổng đơn hàng</h2>

      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item._id} className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
            </div>
            <p className="font-medium">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t mt-4 pt-4 space-y-2">
        <div className="flex justify-between">
          <span>Tạm tính</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between">
          <span>Phí vận chuyển</span>
          <span>
            {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Giảm giá</span>
            <span>- {formatPrice(discountAmount)}</span>
          </div>
        )}
      </div>

      {shippingInfo && (
        <div className="mt-6 border-t pt-4">
          <h3 className="font-semibold mb-2">Thông tin giao hàng</h3>
          <div className="text-sm space-y-1">
            <p>{shippingInfo.fullName}</p>
            <p>{shippingInfo.phone}</p>
            <p>
              {shippingInfo.address}, {shippingInfo.locationNames.wardName},{" "}
              {shippingInfo.locationNames.districtName},{" "}
              {shippingInfo.locationNames.provinceName}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Mã giảm giá</h2>
        <VoucherInput
          productSlug={cartItems[0]?.slug}
          totalAmount={getSubtotal()}
          paymentMethod={paymentMethod === "cod" ? "cash" : paymentMethod}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        onClick={onSubmit}
        className="w-full mt-6 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
      >
        {isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
      </button>

      <div className="mt-4 text-sm text-gray-500">
        <p>Bằng cách đặt hàng, bạn đồng ý với</p>
        <div className="flex flex-wrap mt-1 gap-1">
          <Link
            href="/purchase-policy"
            className="text-blue-800 hover:underline"
          >
            Điều khoản mua hàng
          </Link>
          <span>và</span>
          <Link href="/return-policy" className="text-blue-800 hover:underline">
            Chính sách đổi trả
          </Link>
          <span>của Decor & More.</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
