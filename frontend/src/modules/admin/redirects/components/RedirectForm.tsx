"use client";

import React, { useState, useEffect } from "react";
import { RedirectService } from "../services/redirect.service";

interface RedirectFormProps {
  redirectId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onRefresh?: () => void;
}

const RedirectForm: React.FC<RedirectFormProps> = ({
  redirectId,
  onSuccess,
  onCancel,
  onRefresh,
}) => {
  const [formData, setFormData] = useState<{
    oldPath: string;
    newPath: string;
    type: 'product' | 'post' | 'category' | 'page' | 'other';
    statusCode: number;
    isActive: boolean;
  }>({
    oldPath: "",
    newPath: "",
    type: "other",
    statusCode: 301,
    isActive: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const isEdit = !!redirectId;

  // Tải dữ liệu redirect nếu đang trong chế độ sửa
  useEffect(() => {
    if (isEdit && redirectId) {
      setInitialLoading(true);
      RedirectService.getOne(redirectId)
        .then((data) => {
          setFormData({
            oldPath: data.oldPath,
            newPath: data.newPath,
            type: data.type,
            statusCode: data.statusCode,
            isActive: data.isActive,
          });
        })
        .catch((err) => {
          setMessage({ type: 'error', text: "Lỗi khi tải thông tin: " + err.message });
        })
        .finally(() => {
          setInitialLoading(false);
        });
    }
  }, [isEdit, redirectId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'type') {
      // Xử lý type để đảm bảo đúng định dạng
      setFormData(prev => ({
        ...prev,
        [name]: value as 'product' | 'post' | 'category' | 'page' | 'other'
      }));
    } else if (name === 'statusCode') {
      // Chuyển đổi statusCode thành số
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.oldPath) {
      newErrors.oldPath = "Vui lòng nhập đường dẫn cũ";
    }

    if (!formData.newPath) {
      newErrors.newPath = "Vui lòng nhập đường dẫn mới";
    }

    if (!formData.type) {
      newErrors.type = "Vui lòng chọn loại redirect";
    }

    if (!formData.statusCode) {
      newErrors.statusCode = "Vui lòng chọn mã trạng thái";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      setMessage(null);

      const values = {
        ...formData,
        oldPath: formData.oldPath.startsWith("/") ? formData.oldPath : `/${formData.oldPath}`,
        newPath: formData.newPath.startsWith("/") ? formData.newPath : `/${formData.newPath}`
      };

      if (isEdit) {
        await RedirectService.update(redirectId!, values);
        setMessage({ type: 'success', text: "Cập nhật redirect thành công" });
      } else {
        await RedirectService.create(values);
        setMessage({ type: 'success', text: "Tạo redirect thành công" });
      }

      if (onSuccess) {
        onSuccess();
      }
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: "Lỗi: " + (error.message || "Không thể xử lý yêu cầu") });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Đang tải...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 mb-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="oldPath" className="block text-sm font-medium text-gray-700">
          Đường dẫn cũ <span className="text-red-500">*</span>
        </label>
        <div className="flex rounded-md shadow-sm">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            {window.location.origin}
          </span>
          <input
            type="text"
            id="oldPath"
            name="oldPath"
            value={formData.oldPath}
            onChange={handleChange}
            placeholder="/duong-dan-cu"
            className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border ${errors.oldPath ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} sm:text-sm`}
          />
        </div>
        {errors.oldPath && <p className="mt-1 text-sm text-red-600">{errors.oldPath}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="newPath" className="block text-sm font-medium text-gray-700">
          Đường dẫn mới <span className="text-red-500">*</span>
        </label>
        <div className="flex rounded-md shadow-sm">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            {window.location.origin}
          </span>
          <input
            type="text"
            id="newPath"
            name="newPath"
            value={formData.newPath}
            onChange={handleChange}
            placeholder="/duong-dan-moi"
            className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border ${errors.newPath ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} sm:text-sm`}
          />
        </div>
        {errors.newPath && <p className="mt-1 text-sm text-red-600">{errors.newPath}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Loại redirect <span className="text-red-500">*</span>
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className={`block w-full px-3 py-2 border ${errors.type ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm sm:text-sm`}
        >
          <option value="product">Sản phẩm</option>
          <option value="post">Bài viết</option>
          <option value="category">Danh mục</option>
          <option value="page">Trang</option>
          <option value="other">Khác</option>
        </select>
        {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="statusCode" className="block text-sm font-medium text-gray-700">
          Mã trạng thái <span className="text-red-500">*</span>
        </label>
        <select
          id="statusCode"
          name="statusCode"
          value={formData.statusCode}
          onChange={handleChange}
          className={`block w-full px-3 py-2 border ${errors.statusCode ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm sm:text-sm`}
        >
          <option value={301}>301 - Vĩnh viễn</option>
          <option value={302}>302 - Tạm thời</option>
          <option value={307}>307 - Tạm thời</option>
          <option value={308}>308 - Vĩnh viễn</option>
        </select>
        {errors.statusCode && <p className="mt-1 text-sm text-red-600">{errors.statusCode}</p>}
      </div>

      <div className="flex items-center">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          checked={formData.isActive}
          onChange={handleCheckboxChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
          Kích hoạt
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang xử lý...
            </span>
          ) : isEdit ? "Cập nhật" : "Tạo mới"}
        </button>
      </div>
    </form>
  );
};

export default RedirectForm;