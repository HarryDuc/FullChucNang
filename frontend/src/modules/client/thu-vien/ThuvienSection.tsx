'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useThuvien } from './hooks/useThuvien';

interface ImageDetail {
  _id: string;
  imageUrl: string;
  alt?: string;
  originalName: string;
}

const ThuvienSection = () => {
  const {
    upimgs,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  } = useThuvien();

  // State cho modal xem chi tiết ảnh
  const [selectedImage, setSelectedImage] = useState<ImageDetail | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleLoadMore = () => {
    loadMore();
  };

  // Xử lý click vào ảnh để mở modal
  const handleImageClick = (image: ImageDetail) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  // Đóng modal
  const handleCloseModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  // Xử lý click outside modal để đóng
  const handleModalBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  // Xử lý ESC key để đóng modal
  React.useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showImageModal) {
        handleCloseModal();
      }
    };

    if (showImageModal) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Ngăn scroll background
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [showImageModal]);

  if (error) {
    return (
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="rounded-lg overflow-hidden" style={{
              border: '1px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #CA9E21, #0A6486)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'content-box, border-box'
            }}>
              <div className="bg-white p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Thư viện</h1>
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800">Lỗi: {error}</p>
                  <button
                    onClick={refresh}
                    className="mt-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="rounded-lg overflow-hidden" style={{
            border: '1px solid transparent',
            backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #CA9E21, #0A6486)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'content-box, border-box'
          }}>
            <div className="bg-white p-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#CA9E21] to-[#0A6486] bg-clip-text text-transparent">
                  THƯ VIỆN HÌNH ẢNH
                </h1>
              </div>
              <p className="text-gray-600 text-lg">Khám phá bộ sưu tập hình ảnh của chúng tôi</p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && upimgs.length === 0 && (
          <div className="text-center py-16">
            <div className="rounded-lg overflow-hidden" style={{
              border: '1px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #CA9E21, #0A6486)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'content-box, border-box'
            }}>
              <div className="bg-white p-12">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {upimgs.length > 0 && (
          <div className="space-y-6">
            {upimgs.map((upimg) => (
              <div key={upimg._id} className="group">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors duration-300">
                    {upimg.title}
                  </h3>
                  {upimg.description && (
                    <p className="text-gray-600 text-base mb-4">{upimg.description}</p>
                  )}
                </div>
                {/* Card container */}
                <div className="rounded-lg overflow-hidden shadow-lg transition-all duration-300" style={{
                  border: '1px solid transparent',
                  backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #CA9E21, #0A6486)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'content-box, border-box'
                }}>
                  <div className="bg-white p-6">
                    <div className="flex flex-col gap-6">
                      {/* Images Section - Hiện 4 ảnh mỗi hàng */}
                      <div className="relative">
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          {upimg.images && upimg.images.length > 0 ? (
                            <div className="grid grid-cols-4 gap-4">
                              {upimg.images.map((image) => (
                                <div
                                  key={image._id}
                                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm transition-all duration-300 cursor-pointer hover:shadow-md hover:scale-105"
                                  onClick={() => handleImageClick(image)}
                                >
                                  <img
                                    src={image.imageUrl}
                                    alt={image.alt || image.originalName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p>Chưa có ảnh</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && upimgs.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="rounded-lg overflow-hidden" style={{
              border: '1px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #CA9E21, #0A6486)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'content-box, border-box'
            }}>
              <div className="bg-white p-12">
                <div className="text-gray-400 mb-6">
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Chưa có hình ảnh</h3>
                <p className="text-gray-600">Hình ảnh sẽ được thêm vào đây</p>
              </div>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && upimgs.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-blue-600 text-white rounded-lg hover:from-amber-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium text-lg shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Đang tải...
                </div>
              ) : (
                'Tải thêm hình ảnh'
              )}
            </button>
          </div>
        )}

        {/* Modal xem chi tiết ảnh */}
        {showImageModal && selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50 animate-fadeIn"
            onClick={handleModalBackdropClick}
          >
            <div className="bg-white rounded-xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl animate-scaleIn">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b bg-gray-50">
                {/* <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {selectedImage.alt || selectedImage.originalName}
                  </h3>
                </div> */}
                <div>

                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
                  title="Đóng (ESC)"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Image Content */}
              <div className="p-6">
                <div className="relative flex justify-center">
                  <img
                    src={selectedImage.imageUrl}
                    alt={selectedImage.alt || selectedImage.originalName}
                    className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThuvienSection;