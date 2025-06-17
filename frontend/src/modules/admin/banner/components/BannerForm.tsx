import React, { useEffect } from "react";
import { useAdminBanner } from "../hooks/useBanner";
import { Banner } from "@/modules/client/home/models/banner.model";
import { useForm } from "react-hook-form";

interface BannerFormData {
  title: string;
  description?: string;
  imagePath: string;
  link: string;
  type: "main" | "sub" | "mobile";
  order: number;
  isActive: boolean;
}

interface BannerFormProps {
  banner?: Banner | null;
  open: boolean;
  onCancel: () => void;
}

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const BannerForm: React.FC<BannerFormProps> = ({
  banner,
  open,
  onCancel,
}) => {
  const { useCreateBanner, useUpdateBanner } = useAdminBanner();
  const { mutate: createBanner } = useCreateBanner();
  const { mutate: updateBanner } = useUpdateBanner();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BannerFormData>({
    defaultValues: {
      isActive: true,
      type: "main",
      order: 0,
    },
  });

  useEffect(() => {
    if (banner) {
      reset(banner);
    }
  }, [banner, reset]);

  const onSubmit = (data: BannerFormData) => {
    if (banner?._id) {
      updateBanner({ id: banner._id, data });
    } else {
      createBanner(data);
    }
    onCancel();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-semibold mb-6">
          {banner ? "Chỉnh sửa banner" : "Thêm banner mới"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề
            </label>
            <input
              type="text"
              {...register("title", {
                required: "Tiêu đề không được để trống",
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đường dẫn ảnh
            </label>
            <input
              type="text"
              {...register("imagePath", {
                required: "Đường dẫn ảnh không được để trống",
                validate: {
                  isValidUrl: (value) =>
                    isValidUrl(value) || "Đường dẫn ảnh phải là một URL hợp lệ",
                },
              })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.imagePath && (
              <p className="mt-1 text-sm text-red-600">
                {errors.imagePath.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link liên kết
            </label>
            <input
              type="text"
              {...register("link", {
                required: "Link không được để trống",
                validate: {
                  isValidUrl: (value) =>
                    isValidUrl(value) || "Link phải là một URL hợp lệ",
                },
              })}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.link && (
              <p className="mt-1 text-sm text-red-600">{errors.link.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại
            </label>
            <select
              {...register("type", {
                required: "Vui lòng chọn loại banner",
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="main">Chính</option>
              <option value="sub">Phụ</option>
              <option value="mobile">Mobile</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thứ tự
            </label>
            <input
              type="number"
              {...register("order", {
                required: "Thứ tự không được để trống",
                min: {
                  value: 0,
                  message: "Thứ tự phải là số dương",
                },
                valueAsNumber: true,
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.order && (
              <p className="mt-1 text-sm text-red-600">
                {errors.order.message}
              </p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register("isActive")}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Kích hoạt
            </label>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded transition-colors"
            >
              {banner ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
