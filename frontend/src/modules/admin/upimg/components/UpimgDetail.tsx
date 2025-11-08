'use client';

import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useUpimg } from '../hooks/useUpimg';
import { Upimg } from '../models';
import UpimgForm from './UpimgForm';
import api from '@/config/api';
import imageService from '@/common/services/imageService';

interface UpimgDetailProps {
  upimg: Upimg;
  onClose: () => void;
  onUpdate: () => void;
}

export default function UpimgDetail({ upimg, onClose, onUpdate }: UpimgDetailProps) {
  const { removeImageFromUpimg, loading } = useUpimg();
  const [showEditForm, setShowEditForm] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemoveImage = async (imageId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa ảnh này?')) {
      await removeImageFromUpimg(upimg._id, imageId);
    }
  };

  // Thêm ảnh trực tiếp từ detail view
  const handleAddImages = () => {
    fileInputRef.current?.click();
    setUploadingImages(true);

    // Timeout để tránh bị kẹt loading
    setTimeout(() => {
      if (uploadingImages) {
        console.warn('Upload timeout, resetting loading state');
        setUploadingImages(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }, 60000); // 60 seconds timeout
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      setUploadingImages(false);
      return;
    }

    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
      toast.error('Chỉ chấp nhận file ảnh');
      setUploadingImages(false);
      return;
    }

    try {
      // setUploadingImages(true); // This line is now handled by handleAddImages

      // Nén ảnh trước khi upload
      console.log('Compressing images before upload...');
      const compressedFiles = [];
      for (const file of validFiles) {
        try {
          const compressedFile = await imageService.compressImage(file);
          compressedFiles.push(compressedFile);
          console.log(`Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
        } catch (compressError) {
          console.error('Error compressing file:', file.name, compressError);
          // Nếu nén thất bại, sử dụng file gốc
          compressedFiles.push(file);
        }
      }

      const formData = new FormData();
      compressedFiles.forEach(file => {
        formData.append('files', file);
      });

      await api.put(`/upimgapi/${upimg._id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout
      });

      toast.success('Thêm ảnh thành công!');
      onUpdate(); // Reload data
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Thêm ảnh thất bại!');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="p-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Chi tiết Upimg
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowEditForm(true)}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
          >
            Chỉnh sửa
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Thông tin cơ bản</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-600">Tiêu đề</label>
              <p className="text-gray-800">{upimg.title || 'Không có tiêu đề'}</p>
            </div>
            {upimg.description && (
              <div>
                <label className="block text-sm font-medium text-gray-600">Mô tả</label>
                <p className="text-gray-800">{upimg.description}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-600">Trạng thái</label>
              <span
                className={`inline-block px-2 py-1 text-xs rounded ${
                  upimg.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {upimg.status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Thứ tự</label>
              <p className="text-gray-800">{upimg.order}</p>
            </div>
            {upimg.slug && (
              <div>
                <label className="block text-sm font-medium text-gray-600">Slug</label>
                <p className="text-gray-800">{upimg.slug}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Thông tin hệ thống</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-600">ID</label>
              <p className="text-gray-800 font-mono text-sm">{upimg._id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Ngày tạo</label>
              <p className="text-gray-800">{formatDate(upimg.createdAt)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Ngày cập nhật</label>
              <p className="text-gray-800">{formatDate(upimg.updatedAt)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Số lượng ảnh</label>
              <p className="text-gray-800">{upimg.images.length} ảnh</p>
            </div>
          </div>
        </div>
      </div>

      {/* Images Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">
            Ảnh ({upimg.images.length})
          </h3>
          <button
            onClick={handleAddImages}
            disabled={uploadingImages}
            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition disabled:opacity-50"
          >
            {uploadingImages ? 'Đang tải...' : 'Thêm ảnh'}
          </button>
        </div>

        {upimg.images.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Chưa có ảnh nào</p>
            <button
              onClick={handleAddImages}
              disabled={uploadingImages}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {uploadingImages ? 'Đang tải...' : 'Thêm ảnh đầu tiên'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upimg.images.slice().reverse().map((image) => (
              <div
                key={image._id}
                className="bg-white border rounded-lg overflow-hidden shadow-sm relative group"
              >
                {/* Image */}
                <div className="aspect-square bg-gray-100">
                  <img
                    src={image.imageUrl}
                    alt={image.alt || image.originalName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Image info */}
                <div className="p-2 bg-gray-50">
                  <p className="text-xs text-gray-600 truncate" title={image.originalName}>
                    {image.originalName}
                  </p>
                </div>

                {/* Remove button overlay */}
                <button
                  onClick={() => handleRemoveImage(image._id)}
                  disabled={loading}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  title="Xóa ảnh"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metadata Section */}
      {upimg.metadata && Object.keys(upimg.metadata).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Metadata</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-800 overflow-x-auto">
              {JSON.stringify(upimg.metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <UpimgForm
              upimg={upimg}
              onClose={() => setShowEditForm(false)}
              onSuccess={() => {
                setShowEditForm(false);
                onUpdate();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}