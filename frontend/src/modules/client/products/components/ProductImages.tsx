import React, { useState } from "react";

interface ProductImagesProps {
  productImages: string[];
  selectedImage: string;
  setSelectedImage: (img: string) => void;
  productName: string;
}

const MODAL_WIDTH = 900;
const MODAL_HEIGHT = 600;

const ProductImages: React.FC<ProductImagesProps> = ({
  productImages,
  selectedImage,
  setSelectedImage,
  productName,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(
    productImages.findIndex((img) => img === selectedImage) || 0
  );

  // Open modal and set current index
  const handleMainImageClick = () => {
    const idx = productImages.findIndex((img) => img === selectedImage);
    setModalIndex(idx === -1 ? 0 : idx);
    setIsModalOpen(true);
  };

  // Slide navigation
  const goToPrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setModalIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };
  const goToNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setModalIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation in modal
  React.useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line
  }, [isModalOpen, modalIndex, productImages.length]);

  // Click thumbnail in modal
  const handleModalThumbClick = (idx: number) => {
    setModalIndex(idx);
  };

  return (
    <div className="relative">
      <div className="md:sticky md:top-32 space-y-4">
        <div className="mb-4 border border-gray-200 p-2 bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
          <div
            className="relative h-96 w-full flex items-center justify-center bg-gray-50 rounded-lg cursor-zoom-in"
            onClick={handleMainImageClick}
            tabIndex={0}
            aria-label="Phóng to ảnh sản phẩm"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleMainImageClick();
            }}
            role="button"
          >
            <img
              src={selectedImage || productImages[0]}
              alt={productName}
              className="object-contain transition-all duration-500 transform hover:scale-105 max-h-96 mx-auto"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <span className="absolute bottom-2 right-2 bg-white/80 px-2 py-1 rounded text-xs shadow">
              Nhấn để phóng to
            </span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 px-2">
          {productImages.map((img, index) => (
            <div
              key={index}
              className={`border-2 p-1 cursor-pointer rounded-lg transition-all duration-300 flex items-center justify-center h-20 w-full bg-white shadow-sm focus:outline-none ${
                selectedImage === img
                  ? "border-blue-900 ring-2 ring-blue-900 shadow-md"
                  : "border-gray-200 hover:border-blue-600 hover:ring-2 hover:ring-blue-200"
              }`}
              onClick={() => setSelectedImage(img)}
              tabIndex={0}
              aria-label={`Chọn ảnh ${index + 1}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelectedImage(img);
              }}
            >
              <img
                src={img}
                alt={`${productName} - ảnh ${index + 1}`}
                className="object-cover rounded h-full w-full transition-transform duration-200 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Modal for zoomed image and album */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setIsModalOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="relative bg-white rounded-lg shadow-lg flex flex-col md:flex-row"
            style={{
              width: MODAL_WIDTH,
              height: MODAL_HEIGHT,
              maxWidth: "95vw",
              maxHeight: "95vh",
              minWidth: 320,
              minHeight: 320,
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Main image with navigation */}
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow"
              onClick={goToPrev}
              aria-label="Ảnh trước"
              tabIndex={0}
              type="button"
              style={{ outline: "none" }}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div
              className="flex-1 flex items-center justify-center bg-gray-50"
              style={{
                minWidth: 0,
                minHeight: 0,
                width: "100%",
                height: "100%",
                maxWidth: MODAL_WIDTH - 200,
                maxHeight: MODAL_HEIGHT,
              }}
            >
              <img
                src={productImages[modalIndex]}
                alt={`${productName} - ảnh phóng to`}
                className="object-contain rounded"
                style={{
                  width: "100%",
                  height: "100%",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  minWidth: 0,
                  minHeight: 0,
                  background: "#f9fafb",
                  display: "block",
                }}
                draggable={false}
              />
            </div>
            <button
              className="absolute right-52 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow"
              onClick={goToNext}
              aria-label="Ảnh tiếp theo"
              tabIndex={0}
              type="button"
              style={{ outline: "none" }}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {/* Right: Album thumbnails */}
            <div
              className="flex flex-col items-center justify-start p-4 gap-2 overflow-y-auto"
              style={{
                width: 160,
                minWidth: 120,
                maxWidth: 200,
                height: "100%",
                background: "#fff",
                borderLeft: "1px solid #e5e7eb",
              }}
            >
              <div className="grid grid-cols-2 md:grid-cols-1 gap-2 w-full">
                {productImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`cursor-pointer rounded-lg transition-all duration-300 flex items-center justify-center h-16 w-full bg-white shadow-sm focus:outline-none ${
                      modalIndex === idx
                        ? "border-blue-900 ring-2 ring-blue-900 shadow-md"
                        : "border-gray-200 hover:border-blue-600 hover:ring-2 hover:ring-blue-200"
                    }`}
                    onClick={() => handleModalThumbClick(idx)}
                  >
                    <img
                      src={img}
                      alt={`${productName} - ảnh ${idx + 1}`}
                      className="object-cover rounded h-full w-full transition-transform duration-200 group-hover:scale-105"
                      style={{
                        maxHeight: 60,
                        maxWidth: 90,
                        minHeight: 0,
                        minWidth: 0,
                        objectFit: "cover",
                        background: "#f9fafb",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* Close button */}
            <button
              className="absolute top-2 right-2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow"
              onClick={() => setIsModalOpen(false)}
              aria-label="Đóng"
              tabIndex={0}
              type="button"
              style={{ outline: "none" }}
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImages;
