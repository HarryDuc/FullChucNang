'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useUpimg } from '../hooks/useUpimg';
import UpimgDetail from './UpimgDetail';
import UpimgForm from './UpimgForm';
import api from '@/config/api';
import imageService from '@/common/services/imageService';

export default function UpimgList() {
  const {
    upimgs,
    selectedUpimg,
    setSelectedUpimg,
    loading,
    fetchUpimgs,
    deleteUpimg,
    searchUpimgs,
    getUpimgsByStatus,
  } = useUpimg();

  const [showForm, setShowForm] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingUpimgId, setUploadingUpimgId] = useState<string | null>(null);

  useEffect(() => {
    fetchUpimgs();
  }, [fetchUpimgs]);

  const handleSearch = async () => {
    if (searchKeyword.trim()) {
      await searchUpimgs(searchKeyword);
    } else {
      await fetchUpimgs();
    }
  };

  const handleStatusFilter = async (status: string) => {
    setStatusFilter(status);
    if (status === 'all') {
      await fetchUpimgs();
    } else {
      await getUpimgsByStatus(status);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this upimg?')) {
      await deleteUpimg(id);
    }
  };

  // Thêm ảnh trực tiếp từ danh sách
  const handleAddImages = (upimgId: string) => {
    fileInputRef.current?.click();
    setUploadingUpimgId(upimgId);

    // Timeout để tránh bị kẹt loading
    setTimeout(() => {
      if (uploadingUpimgId === upimgId) {
        console.warn('Upload timeout, resetting loading state');
        setUploadingUpimgId(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }, 60000); // 60 seconds timeout
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!uploadingUpimgId || files.length === 0) {
      setUploadingUpimgId(null);
      return;
    }

    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
      toast.error('Chỉ chấp nhận file ảnh');
      setUploadingUpimgId(null);
      return;
    }

    try {
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

      await api.put(`/upimgapi/${uploadingUpimgId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout
      });

      toast.success('Thêm ảnh thành công!');
      fetchUpimgs(); // Reload danh sách
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Thêm ảnh thất bại!');
    } finally {
      setUploadingUpimgId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Xóa ảnh trực tiếp từ danh sách
  const handleRemoveImage = async (upimgId: string, imageId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa ảnh này?')) return;

    try {
      await api.delete(`/upimgapi/${upimgId}/images/${imageId}`);
      toast.success('Đã xóa ảnh!');
      fetchUpimgs(); // Reload danh sách
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Xóa ảnh thất bại!');
    }
  };

  if (loading && upimgs.length === 0) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="p-4">
      {/* Hidden file input for adding images */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
          Quản lý Upimg
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Tạo Upimg mới
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
        <div className="flex-1">
          <div className="flex">
            <input
              type="text"
              placeholder="Tìm kiếm upimg..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="px-3 py-2 bg-gray-600 text-white rounded-r hover:bg-gray-700 transition"
            >
              Tìm
            </button>
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Upimg List */}
      {upimgs.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Không có upimg nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {upimgs.map((upimg) => {
            console.log('Rendering upimg:', upimg);
            console.log('Upimg images:', upimg.images);
            return (
              <div
                key={upimg._id}
                className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="p-4 border-b">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-800 truncate">
                      {upimg.title || 'Không có tiêu đề'}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        upimg.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {upimg.status}
                    </span>
                  </div>
                  {upimg.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {upimg.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-500">
                      <span>Thứ tự: {upimg.order}</span>
                      <span className="mx-2">•</span>
                      <span>
                        {new Date(upimg.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedUpimg(upimg)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                      >
                        Xem chi tiết
                      </button>
                      <button
                        onClick={() => handleDelete(upimg._id)}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>

                {/* Images Section with Add/Remove */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Ảnh ({upimg.images.length})
                    </span>
                    <button
                      onClick={() => handleAddImages(upimg._id)}
                      disabled={uploadingUpimgId === upimg._id}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {uploadingUpimgId === upimg._id ? 'Đang tải...' : 'Thêm ảnh'}
                    </button>
                  </div>

                  {upimg.images.length > 0 ? (
                    <div className="grid grid-cols-6 gap-2">
                      {upimg.images.slice().reverse().map((image) => (
                        <div
                          key={image._id}
                          className="aspect-square bg-gray-100 rounded overflow-hidden relative group"
                        >
                          <img
                            src={image.imageUrl}
                            alt={image.alt || image.originalName}
                            className="w-full h-full object-cover"
                          />
                          {/* Remove button overlay */}
                          <button
                            onClick={() => handleRemoveImage(upimg._id, image._id)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Xóa ảnh"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Chưa có ảnh
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <UpimgForm
              onClose={() => setShowForm(false)}
              onSuccess={() => {
                setShowForm(false);
                fetchUpimgs();
              }}
            />
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedUpimg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <UpimgDetail
              upimg={selectedUpimg}
              onClose={() => setSelectedUpimg(null)}
              onUpdate={() => {
                setSelectedUpimg(null);
                fetchUpimgs();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}