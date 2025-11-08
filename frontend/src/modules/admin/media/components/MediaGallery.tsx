"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useImages } from "@/modules/admin/media/hooks/useImages";
import { ImageResponse } from "@/modules/admin/media/services/images.service";

interface MediaGalleryProps {
  onSelect?: (image: ImageResponse) => void;
  className?: string;
}

export function MediaGallery({ onSelect, className }: MediaGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageResponse | null>(
    null
  );
  const {
    images,
    isLoadingImages,
    isUploading,
    isDeleting,
    uploadImage,
    deleteImage,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    imagesError,
  } = useImages();

  // Ref for the intersection observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, options);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        uploadImage(file);
      }
    },
    [uploadImage]
  );

  const handleImageClick = useCallback((image: ImageResponse) => {
    setSelectedImage(image);
  }, []);

  const handleDeleteClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, slug: string) => {
      event.stopPropagation();
      if (window.confirm("Bạn có chắc chắn muốn xóa ảnh này?")) {
        deleteImage(slug);
        setSelectedImage(null);
      }
    },
    [deleteImage]
  );

  if (isLoadingImages) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (imagesError) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        Có lỗi xảy ra khi tải ảnh. Vui lòng thử lại sau.
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Thư viện ảnh ({images.length})</h2>
        <div>
          <input
            type="file"
            id="image-upload"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <label
            htmlFor="image-upload"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer disabled:opacity-50"
          >
            {isUploading ? "Đang tải lên..." : "Tải ảnh lên"}
          </label>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          Chưa có ảnh nào trong thư viện
        </div>
      ) : (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
          {images.map((image) => (
            <div
              key={image._id}
              className={`group relative aspect-square rounded-lg overflow-hidden border cursor-pointer hover:border-blue-500 transition-colors`}
              onClick={() => handleImageClick(image)}
            >
              <img
                src={image.imageUrl}
                alt={image.alt || image.originalName}
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              />
            </div>
          ))}
        </div>
      )}

      {/* Loading indicator for next page */}
      {(isFetchingNextPage || hasNextPage) && (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center py-4"
        >
          {isFetchingNextPage ? (
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          ) : hasNextPage ? (
            <div className="h-10" />
          ) : null}
        </div>
      )}

      {/* Modal hiển thị khi click vào ảnh */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Chi tiết ảnh</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedImage(null)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="relative aspect-video">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.alt || selectedImage.originalName}
                className="object-contain"
              />
            </div>
            <div className="space-y-2 mt-4">
              <p>
                <strong>Tên file:</strong> {selectedImage.originalName}
              </p>
              <p>
                <strong>Đường dẫn:</strong>{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded">
                  {selectedImage.location}
                </code>
              </p>
              <p>
                <strong>URL:</strong>{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded">
                  {selectedImage.imageUrl}
                </code>
              </p>
              <button
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                onClick={(e) => handleDeleteClick(e, selectedImage.slug)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 inline-block mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Xóa ảnh
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
