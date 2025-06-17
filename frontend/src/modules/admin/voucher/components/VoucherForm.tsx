import { useState, useEffect } from "react";
import { useVoucherMutation } from "../hooks/useVouchers";
import {
  Voucher,
  CreateVoucherDto,
  VoucherType,
  PaymentMethod,
  DiscountType,
} from "../models/voucher.model";

interface VoucherFormProps {
  voucher?: Voucher | null;
  onClose: () => void;
}

export default function VoucherForm({ voucher, onClose }: VoucherFormProps) {
  const { createMutation, updateMutation } = useVoucherMutation();
  const [formData, setFormData] = useState<CreateVoucherDto>({
    code: "",
    description: "",
    voucherType: VoucherType.GLOBAL,
    productSlugs: [],
    quantity: 1,
    startDate: new Date(),
    endDate: new Date(),
    paymentMethod: PaymentMethod.ALL,
    discountType: DiscountType.PERCENTAGE,
    discountValue: 0,
    minimumAmount: 0,
    isActive: true,
  });
  const [productSlug, setProductSlug] = useState("");

  useEffect(() => {
    if (voucher) {
      setFormData({
        code: voucher.code,
        description: voucher.description,
        voucherType: voucher.voucherType,
        productSlugs: voucher.productSlugs,
        quantity: voucher.quantity,
        startDate: new Date(voucher.startDate),
        endDate: new Date(voucher.endDate),
        paymentMethod: voucher.paymentMethod,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        minimumAmount: voucher.minimumAmount,
        isActive: voucher.isActive,
      });
    }
  }, [voucher]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (voucher) {
      updateMutation.mutate(
        {
          id: voucher._id,
          data: formData,
        },
        {
          onSuccess: onClose,
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: onClose,
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const addProductSlug = () => {
    if (productSlug && !formData.productSlugs.includes(productSlug)) {
      setFormData((prev) => ({
        ...prev,
        productSlugs: [...prev.productSlugs, productSlug],
      }));
      setProductSlug("");
    }
  };

  const removeProductSlug = (slug: string) => {
    setFormData((prev) => ({
      ...prev,
      productSlugs: prev.productSlugs.filter((s) => s !== slug),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {voucher ? "Edit Voucher" : "Create Voucher"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Code
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Voucher Type
            </label>
            <select
              name="voucherType"
              value={formData.voucherType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {Object.values(VoucherType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* Product Slugs */}
        {formData.voucherType === VoucherType.PRODUCT_SPECIFIC && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Slugs
            </label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={productSlug}
                onChange={(e) => setProductSlug(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter product slug"
              />
              <button
                type="button"
                onClick={addProductSlug}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.productSlugs.map((slug) => (
                <span
                  key={slug}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {slug}
                  <button
                    type="button"
                    onClick={() => removeProductSlug(slug)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Discount Settings */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Discount Type
            </label>
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {Object.values(DiscountType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Discount Value
            </label>
            <input
              type="number"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleChange}
              min={0}
              max={
                formData.discountType === DiscountType.PERCENTAGE
                  ? 100
                  : undefined
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Minimum Amount (VND)
            </label>
            <input
              type="number"
              name="minimumAmount"
              value={formData.minimumAmount}
              onChange={handleChange}
              min={0}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Quantity and Payment Method */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min={1}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment Method
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {Object.values(PaymentMethod).map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Validity Period */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="datetime-local"
              name="startDate"
              value={formData.startDate.toISOString().slice(0, 16)}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  startDate: new Date(e.target.value),
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate.toISOString().slice(0, 16)}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  endDate: new Date(e.target.value),
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isActive: e.target.checked,
                }))
              }
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Active</span>
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending
            ? "Saving..."
            : "Save"}
        </button>
      </div>
    </form>
  );
}
