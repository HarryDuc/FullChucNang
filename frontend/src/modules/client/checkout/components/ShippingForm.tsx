import React from "react";
import LocationPicker from "./LocationPicker";

interface ShippingInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  province: string | number;
  district: string | number;
  ward: string | number;
  note: string;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  province?: string;
  district?: string;
  ward?: string;
}

interface ShippingFormProps {
  shippingInfo: ShippingInfo;
  errors: FormErrors;
  touched: Record<string, boolean>;
  onFieldChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onFieldBlur: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onLocationChange: (location: {
    province: string | number;
    district: string | number;
    ward: string | number;
  }) => void;
  onTouch: (field: string) => void;
}

const ShippingForm = ({
  shippingInfo,
  errors,
  touched,
  onFieldChange,
  onFieldBlur,
  onLocationChange,
  onTouch,
}: ShippingFormProps) => {
  return (
    <div className="bg-white border mb-8">
      <div className="border-b py-4 px-6 font-medium text-lg bg-gray-50">
        THÔNG TIN GIAO HÀNG
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={shippingInfo.fullName}
              onChange={onFieldChange}
              onBlur={onFieldBlur}
              className={`w-full p-2 border ${
                errors.fullName && touched.fullName
                  ? "border-red-500"
                  : "border-gray-300"
              } focus:border-blue-500 focus:outline-none`}
            />
            {errors.fullName && touched.fullName && (
              <p className="mt-1 text-red-500 text-sm error-message">
                {errors.fullName}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={shippingInfo.phone}
              onChange={onFieldChange}
              onBlur={onFieldBlur}
              className={`w-full p-2 border ${
                errors.phone && touched.phone
                  ? "border-red-500"
                  : "border-gray-300"
              } focus:border-blue-500 focus:outline-none`}
            />
            {errors.phone && touched.phone && (
              <p className="mt-1 text-red-500 text-sm error-message">
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={shippingInfo.email}
            onChange={onFieldChange}
            onBlur={onFieldBlur}
            className={`w-full p-2 border ${
              errors.email && touched.email
                ? "border-red-500"
                : "border-gray-300"
            } focus:border-blue-500 focus:outline-none`}
          />
          {errors.email && touched.email && (
            <p className="mt-1 text-red-500 text-sm error-message">
              {errors.email}
            </p>
          )}
        </div>

        <LocationPicker
          value={{
            province: shippingInfo.province,
            district: shippingInfo.district,
            ward: shippingInfo.ward,
          }}
          onChange={onLocationChange}
          errors={{
            province: touched.province ? errors.province : undefined,
            district: touched.district ? errors.district : undefined,
            ward: touched.ward ? errors.ward : undefined,
          }}
          onTouch={onTouch}
        />

        <div className="mb-4">
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Địa chỉ chi tiết <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={shippingInfo.address}
            onChange={onFieldChange}
            onBlur={onFieldBlur}
            placeholder="Số nhà, tên đường..."
            className={`w-full p-2 border ${
              errors.address && touched.address
                ? "border-red-500"
                : "border-gray-300"
            } focus:border-blue-500 focus:outline-none`}
          />
          {errors.address && touched.address && (
            <p className="mt-1 text-red-500 text-sm error-message">
              {errors.address}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="note"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ghi chú đơn hàng
          </label>
          <textarea
            id="note"
            name="note"
            value={shippingInfo.note}
            onChange={onFieldChange}
            rows={3}
            placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
            className="w-full p-2 border border-gray-300 focus:border-blue-500 focus:outline-none"
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default ShippingForm;
