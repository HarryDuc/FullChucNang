"use client"
import React, { useState, useEffect } from "react";
import {
  CreateVietQRConfigDto,
  UpdateVietQRConfigDto,
} from "../models/vietqr-config";

interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
  short_name: string;
  support: number;
  isTransfer: number;
  swift_code: string;
}

interface VietQRConfigFormProps {
  initialValues?: CreateVietQRConfigDto | UpdateVietQRConfigDto;
  onSubmit: (values: CreateVietQRConfigDto | UpdateVietQRConfigDto) => void;
  onCancel: () => void;
}

export const VietQRConfigForm: React.FC<VietQRConfigFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<
    CreateVietQRConfigDto | UpdateVietQRConfigDto
  >(
    initialValues || {
      bankName: "",
      bankBin: "",
      accountNumber: "",
      accountName: "",
      template: "",
      active: false,
    }
  );

  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await fetch("https://api.vietqr.io/v2/banks");
        const data = await response.json();

        if (data.code === "00") {
          setBanks(data.data);
        } else {
          setError("Không thể tải danh sách ngân hàng");
        }
      } catch (err) {
        console.log(err);
        setError("Có lỗi xảy ra khi tải danh sách ngân hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchBanks();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (name === "bank") {
      const selectedBank = banks.find((bank) => bank.bin === value);
      setFormData((prev) => ({
        ...prev,
        bankBin: value,
        bankName: selectedBank?.name || "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="bank"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Ngân hàng
        </label>
        <select
          id="bank"
          name="bank"
          value={formData.bankBin}
          onChange={handleChange}
          required
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="">Chọn ngân hàng</option>
          {loading ? (
            <option value="" disabled>
              Đang tải danh sách ngân hàng...
            </option>
          ) : error ? (
            <option value="" disabled>
              {error}
            </option>
          ) : (
            banks.map((bank) => (
              <option key={bank.bin} value={bank.bin}>
                <span style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={bank.logo}
                    alt={bank.shortName || bank.name}
                    style={{
                      width: 24,
                      height: 24,
                      objectFit: "contain",
                      display: "inline-block",
                      marginRight: 6,
                      verticalAlign: "middle",
                    }}
                  />
                  {bank.shortName || bank.name} ({bank.code}) - {bank.name} [{bank.bin}]
                </span>
              </option>
            ))
          )}
        </select>
        {/* For better UX, show logo and info below select if a bank is selected */}
        {formData.bankBin && !loading && !error && (
          (() => {
            const selectedBank = banks.find((b) => b.bin === formData.bankBin);
            if (!selectedBank) return null;
            return (
              <div className="flex items-center mt-2 space-x-2">
                <img
                  src={selectedBank.logo}
                  alt={selectedBank.shortName || selectedBank.name}
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <div className="font-semibold">{selectedBank.shortName || selectedBank.name} ({selectedBank.code})</div>
                  <div className="text-xs text-gray-500">{selectedBank.name} - BIN: {selectedBank.bin}</div>
                </div>
              </div>
            );
          })()
        )}
      </div>

      <div>
        <label
          htmlFor="accountNumber"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Số tài khoản
        </label>
        <input
          type="text"
          id="accountNumber"
          name="accountNumber"
          value={formData.accountNumber}
          onChange={handleChange}
          placeholder="VD: 1234567890"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="accountName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Tên tài khoản
        </label>
        <input
          type="text"
          id="accountName"
          name="accountName"
          value={formData.accountName}
          onChange={handleChange}
          placeholder="VD: NGUYEN VAN A"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="template"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Template
        </label>
        <select
          id="template"
          name="template"
          value={formData.template}
          onChange={(e) => handleChange(e as any)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Chọn template</option>
          <option value="compact">
            Compact - (540x540) - QR kèm logo VietQR, Napas, ngân hàng
          </option>
          <option value="compact2">
            Compact 2 - (540x640) - Bao gồm : Mã QR, các logo , thông tin chuyển
            khoản
          </option>
          <option value="qr_only">
            QR Only - (540x640) - Trả về ảnh QR đơn giản, chỉ bao gồm QR
          </option>
          <option value="print">
            Print - (540x640) - Bao gồm : Mã QR, các logo và đầy đủ thông tin
            chuyển khoản
          </option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="active"
          name="active"
          checked={formData.active}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
          Kích hoạt
        </label>
      </div>

      <div className="flex space-x-2 pt-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {initialValues ? "Cập nhật" : "Tạo mới"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Hủy
        </button>
      </div>
    </form>
  );
};
