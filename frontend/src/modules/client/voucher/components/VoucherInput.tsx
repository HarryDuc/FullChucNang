"use client";

import { useState, useEffect } from "react";
import { useVoucher } from "../hooks/useVoucher";
import { formatCurrency } from "../../../../../utils/format";
import { formatPrice } from "../../../../../utils/cartUtils";
import { Voucher } from "../models/voucher.model";

interface VoucherInputProps {
  productSlug?: string;
  userId?: string;
  paymentMethod?: string;
  totalAmount: number;
  onApply?: (voucher: Voucher, discountAmount: number) => void;
}

export default function VoucherInput({
  productSlug,
  userId,
  paymentMethod,
  totalAmount,
  onApply,
}: VoucherInputProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Add payment method mapping
  const mapPaymentMethod = (method?: string): string | undefined => {
    if (!method) return undefined;

    const methodMap: Record<string, string> = {
      cod: "COD",
      bankTransfer: "BANK",
      cash: "COD",
    };

    return methodMap[method] || method.toUpperCase();
  };

  const {
    voucherCode,
    appliedVoucher,
    discountAmount,
    finalPrice,
    isCheckingVoucher,
    checkVoucher,
    removeVoucher,
    updateTotalAmount,
  } = useVoucher(totalAmount);

  // Use useEffect to update total amount when it changes
  useEffect(() => {
    if (totalAmount !== 0) {
      updateTotalAmount(totalAmount);
    }
  }, [totalAmount, updateTotalAmount]);

  const handleApplyVoucher = async () => {
    setError(null);
    try {
      const success = await checkVoucher(
        code,
        productSlug,
        userId,
        mapPaymentMethod(paymentMethod)
      );
      if (success && onApply && appliedVoucher) {
        onApply(appliedVoucher, discountAmount);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể áp dụng voucher");
      console.error("Voucher error:", err);
    }
  };

  const handleRemoveVoucher = () => {
    removeVoucher();
    if (onApply) {
      onApply({} as Voucher, 0);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex space-x-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Nhập mã giảm giá"
            disabled={!!appliedVoucher}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {appliedVoucher ? (
            <button
              onClick={handleRemoveVoucher}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Hủy
            </button>
          ) : (
            <button
              onClick={handleApplyVoucher}
              disabled={isCheckingVoucher || !code}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isCheckingVoucher ? "Đang kiểm tra..." : "Áp dụng"}
            </button>
          )}
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

      {appliedVoucher && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-green-800">
                Đã áp dụng mã: {voucherCode}
              </h3>
              <p className="text-xs text-green-600 mt-1">
                {appliedVoucher.description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-green-800">
                Giảm giá: {formatPrice(discountAmount)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {appliedVoucher.discountType === "PERCENTAGE"
                  ? `Giảm ${appliedVoucher.discountValue}%`
                  : `Giảm ${formatPrice(appliedVoucher.discountValue)}`}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-4 flex justify-between">
        <div className="flex justify-between font-semibold text-lg pt-2 border-t w-full">
          <span>Tổng cộng</span>
          <span>{formatPrice(finalPrice)}</span>
        </div>
      </div>
    </div>
  );
}
