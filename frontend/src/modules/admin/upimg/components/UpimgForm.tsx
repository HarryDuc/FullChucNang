'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useUpimg } from '../hooks/useUpimg';
import { Upimg } from '../models';

interface UpimgFormProps {
  upimg?: Upimg; // For editing existing upimg
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpimgForm({ upimg, onClose, onSuccess }: UpimgFormProps) {
  const {
    createUpimg,
    updateUpimg,
    loading,
  } = useUpimg();

  const [formData, setFormData] = useState({
    title: upimg?.title || '',
    description: upimg?.description || '',
    status: upimg?.status || 'active',
    order: upimg?.order || 0,
    slug: upimg?.slug || '',
  });

  const isEditing = !!upimg;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Submitting form data:', formData);

    try {
      if (isEditing) {
        // Update existing upimg
        const result = await updateUpimg(upimg._id, formData);
          console.log('Form: Update result:', result);
      } else {
        // Create new upimg
          const result = await createUpimg(formData);
          console.log('Form: Create result:', result);
      }
      toast.success(isEditing ? 'Cập nhật thành công!' : 'Tạo upimg thành công!');
      onSuccess();
    } catch (error) {
      console.error('Error saving upimg:', error);
      toast.error('Có lỗi xảy ra khi lưu upimg');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {isEditing ? 'Chỉnh sửa Upimg' : 'Tạo Upimg mới'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tiêu đề (tùy chọn)
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required={false}
            autoComplete="off"
            spellCheck="false"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập tiêu đề upimg (tùy chọn)"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả (tùy chọn)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập mô tả (tùy chọn)"
          />
        </div>

        {/* Status and Order */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thứ tự
            </label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug (tùy chọn)
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="slug-tu-dong"
          />
        </div>

        {/* Info text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            💡 <strong>Mẹo:</strong> Sau khi tạo upimg, bạn có thể thêm ảnh trực tiếp từ danh sách bằng nút "Thêm ảnh".
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : (isEditing ? 'Cập nhật' : 'Tạo')}
          </button>
        </div>
      </form>
    </div>
  );
} 