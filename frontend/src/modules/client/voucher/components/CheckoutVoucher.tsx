"use client";

import { useState } from "react";
import VoucherInput from "./VoucherInput";
import AvailableVouchers from "./AvailableVouchers";

interface CheckoutVoucherProps {
  productSlug?: string;
  userId?: string;
  paymentMethod?: string;
  totalAmount: number;
  onApplyVoucher: (discountAmount: number, finalPrice: number) => void;
}

export default function CheckoutVoucher({
  productSlug,
  userId,
  paymentMethod,
  totalAmount,
  onApplyVoucher,
}: CheckoutVoucherProps) {
  const [showAvailableVouchers, setShowAvailableVouchers] = useState(false);
  const [, setSelectedVoucherCode] = useState("");

  const handleSelectVoucher = (code: string) => {
    setSelectedVoucherCode(code);
    setShowAvailableVouchers(false);
  };

  return (
    <div className="border border-gray-200 rounded-md p-4 my-4">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Discount</h2>

      <VoucherInput
        productSlug={productSlug}
        userId={userId}
        paymentMethod={paymentMethod}
        totalAmount={totalAmount}
        onApply={() => onApplyVoucher}
      />

      <div className="mt-4">
        <button
          onClick={() => setShowAvailableVouchers(!showAvailableVouchers)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showAvailableVouchers
            ? "Hide available vouchers"
            : "Show available vouchers"}
        </button>

        {showAvailableVouchers && (
          <AvailableVouchers
            productSlug={productSlug}
            userId={userId}
            paymentMethod={paymentMethod}
            onSelectVoucher={handleSelectVoucher}
          />
        )}
      </div>
    </div>
  );
}
