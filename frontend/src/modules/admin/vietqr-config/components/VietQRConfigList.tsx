"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useVietQRConfigs } from "../hooks/useVietQRConfigs";

// Định nghĩa kiểu cho Bank để lấy shortName dựa trên binCode
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

export const VietQRConfigList: React.FC = () => {
  const { configs, loading, setActiveConfig } = useVietQRConfigs();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await fetch("https://api.vietqr.io/v2/banks");
        const data = await response.json();
        if (data.code === "00") {
          setBanks(data.data);
        }
      } catch (err) {
        // ignore error, just don't show shortName
      } finally {
        setBanksLoading(false);
      }
    };
    fetchBanks();
  }, []);

  // Hàm lấy shortName từ binCode
  const getShortNameByBin = (bin: string) => {
    const bank = banks.find((b) => b.bin === bin);
    return bank?.shortName || "";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngân hàng
            </th>
            {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mã ngân hàng
            </th> */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ShortName (theo bin)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Số tài khoản
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tên tài khoản
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Template
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {configs.map((config) => (
            <tr key={config._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {config.bankName}
              </td>
              {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {config.bankBin}
              </td> */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {banksLoading
                  ? "Đang tải..."
                  : getShortNameByBin(config.bankBin) || <span className="text-gray-400 italic">Không có</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {config.accountNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {config.accountName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {config.template}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    config.active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {config.active ? "Đang hoạt động" : "Không hoạt động"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <Link
                  href={`/admin/vietqr-config/edit/${config._id}`}
                  className="text-blue-600 hover:text-blue-900 bg-blue-100 px-3 py-1 rounded-md"
                >
                  Sửa
                </Link>
                {!config.active && (
                  <button
                    onClick={() => setActiveConfig(config._id)}
                    className="text-green-600 hover:text-green-900 bg-green-100 px-3 py-1 rounded-md"
                  >
                    Kích hoạt
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
