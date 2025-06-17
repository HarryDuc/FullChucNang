"use client";

import { useState, useCallback } from "react";
import { useImages } from "@/modules/admin/media/hooks/useImages";
import Image from "next/image";
import { ImageResponse } from "@/modules/admin/media/services/images.service";

interface MediaGalleryProps {
  onSelect?: (image: ImageResponse) => void;
  className?: string;
}

export function MediaGallery({ onSelect, className }: MediaGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageResponse | null>(
    null
  );
  const [showDialog, setShowDialog] = useState(false);
  const {
    images,
    isLoadingImages,
    isUploading,
    isDeleting,
    uploadImage,
    deleteImage,
  } = useImages();

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        uploadImage(file);
      }
    },
    [uploadImage]
  );

  const handleImageClick = useCallback(
    (image: ImageResponse) => {
      setSelectedImage(image);
      if (onSelect) {
        onSelect(image);
      }
    },
    [onSelect]
  );

  const handleDeleteClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, slug: string) => {
      event.stopPropagation();
      if (window.confirm("Bạn có chắc chắn muốn xóa ảnh này?")) {
        deleteImage(slug);
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

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Thư viện ảnh</h2>
        <div>
          <input
            type="file"
            id="image-upload"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {images.map((image) => (
          <div
            key={image._id}
            className={`group relative aspect-square rounded-lg overflow-hidden border cursor-pointer hover:border-blue-500 transition-colors ${
              selectedImage?._id === image._id ? "border-blue-500" : ""
            }`}
            onClick={() => handleImageClick(image)}
          >
            <Image
              src={image.imageUrl}
              alt={image.alt || image.originalName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                onClick={(e) => handleDeleteClick(e, image.slug)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg
                    className="w-4 h-4"
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
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <>
          <button
            className="px-4 py-2 border rounded-md hover:bg-gray-100"
            onClick={() => setShowDialog(true)}
          >
            Xem ảnh đã chọn
          </button>

          {showDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Chi tiết ảnh</h3>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowDialog(false)}
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
                  <Image
                    src={selectedImage.imageUrl}
                    alt={selectedImage.alt || selectedImage.originalName}
                    fill
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
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
