"use client";

import { useValidVouchers } from "../hooks/useVoucher";
import { formatCurrency, formatDate } from "@/utils/format";
import { DiscountType } from "../../../admin/voucher/models/voucher.model";

interface AvailableVouchersProps {
  productSlug?: string;
  userId?: string;
  paymentMethod?: string;
  onSelectVoucher?: (code: string) => void;
}

export default function AvailableVouchers({
  productSlug,
  userId,
  paymentMethod,
  onSelectVoucher,
}: AvailableVouchersProps) {
  const {
    data: vouchers,
    isLoading,
    error,
  } = useValidVouchers(productSlug, userId, paymentMethod);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
        <p className="text-sm text-red-600">
          Failed to load available vouchers
        </p>
      </div>
    );
  }

  if (!vouchers || vouchers.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 my-4">
        <p className="text-sm text-gray-600">No vouchers available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 my-4">
      <h3 className="text-lg font-medium text-gray-900">Available Vouchers</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {vouchers.map((voucher) => (
          <div
            key={voucher._id}
            className="border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectVoucher && onSelectVoucher(voucher.code)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-md font-bold text-blue-600">
                  {voucher.code}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {voucher.description}
                </p>
              </div>
              <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                {voucher.discountType === DiscountType.PERCENTAGE
                  ? `${voucher.discountValue}% OFF`
                  : `${formatCurrency(voucher.discountValue)} OFF`}
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
              <div>Valid until: {formatDate(voucher.endDate)}</div>
              <div>
                Used: {voucher.usedCount}/{voucher.quantity}
              </div>
            </div>

            {voucher.voucherType === "PRODUCT_SPECIFIC" && (
              <div className="mt-2 text-xs text-gray-500">
                <span className="font-medium">Products:</span>{" "}
                {voucher.productSlugs.join(", ")}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
