"use client";
import React, { useState } from "react";
import { useAdminBanner } from "../hooks/useBanner";
import { Banner } from "@/modules/client/home/models/banner.model";
import { BannerForm } from "./BannerForm";
import Image from "next/image";

export const BannerList: React.FC = () => {
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);

  const { useGetBanners, useToggleBannerActive, useDeleteBanner } =
    useAdminBanner();
  const { data: banners = [], isLoading } = useGetBanners();
  const { mutate: toggleActive } = useToggleBannerActive();
  const { mutate: deleteBanner } = useDeleteBanner();

  const handleEdit = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setBannerToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (bannerToDelete) {
      deleteBanner(bannerToDelete);
      setShowDeleteConfirm(false);
      setBannerToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          onClick={() => {
            setSelectedBanner(null);
            setIsModalOpen(true);
          }}
        >
          Thêm banner mới
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Hình ảnh
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Tiêu đề
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Loại
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Thứ tự
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {banners.map((banner) => (
              <tr key={banner._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Image
                    src={banner.imagePath}
                    alt={banner.title || "Banner"}
                    className="w-24 h-16 object-cover rounded"
                    width={96}
                    height={64}
                  />
                </td>
                <td className="px-6 py-4">{banner.title || "---"}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      banner.type === "main"
                        ? "bg-blue-100 text-blue-800"
                        : banner.type === "sub"
                        ? "bg-green-100 text-green-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {banner.type === "main"
                      ? "Chính"
                      : banner.type === "sub"
                      ? "Phụ"
                      : "Mobile"}
                  </span>
                </td>
                <td className="px-6 py-4">{banner.order}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleActive(banner._id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      banner.isActive ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        banner.isActive ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <BannerForm
          banner={selectedBanner}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedBanner(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa banner này?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setBannerToDelete(null);
                }}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded transition-colors"
                onClick={confirmDelete}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
