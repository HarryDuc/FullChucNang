import React, { useState, useRef, useEffect } from "react";

import { ProductVariant } from "../models/product.model";

interface ProductImagesProps {
  productImages: string[];
  selectedImage: string;
  setSelectedImage: (img: string) => void;
  productName: string;
  variantImageMap: Map<string, ProductVariant>;
  selectedVariant: ProductVariant | null;
}

const MODAL_WIDTH = 900;
const MODAL_HEIGHT = 600;

const ProductImages: React.FC<ProductImagesProps> = ({
  productImages,
  selectedImage,
  setSelectedImage,
  productName,
  variantImageMap,
  selectedVariant,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(
    productImages.findIndex((img) => img === selectedImage) || 0
  );
  const [showAllImages, setShowAllImages] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const IMAGES_PER_PAGE = 12; // Hiển thị 2 hàng x 4 cột = 8 ảnh

  // Scroll to active thumbnail
  const scrollToActiveThumb = (index: number) => {
    if (!thumbnailsContainerRef.current || !thumbnailRefs.current[index]) return;
    
    const container = thumbnailsContainerRef.current;
    const thumbnail = thumbnailRefs.current[index];
    
    if (window.innerWidth >= 768) {
      // Desktop: Vertical scrolling
      const containerHeight = container.clientHeight;
      const thumbTop = thumbnail.offsetTop;
      const thumbHeight = thumbnail.clientHeight;
      
      // Calculate the ideal scroll position to center the thumbnail
      const idealScrollTop = thumbTop - (containerHeight - thumbHeight) / 2;
      
      container.scrollTo({
        top: idealScrollTop,
        behavior: 'smooth'
      });
    } else {
      // Mobile: Horizontal scrolling
      const containerWidth = container.clientWidth;
      const thumbLeft = thumbnail.offsetLeft;
      const thumbWidth = thumbnail.clientWidth;
      
      // Calculate the ideal scroll position to center the thumbnail
      const idealScrollLeft = thumbLeft - (containerWidth - thumbWidth) / 2;
      
      container.scrollTo({
        left: idealScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Effect to scroll to active thumbnail when modalIndex changes
  useEffect(() => {
    if (isModalOpen) {
      scrollToActiveThumb(modalIndex);
    }
  }, [modalIndex, isModalOpen]);

  // Xử lý sự kiện vuốt
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrev();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  // Open modal and set current index
  const handleMainImageClick = () => {
    const idx = productImages.findIndex((img) => img === selectedImage);
    setModalIndex(idx === -1 ? 0 : idx);
    setIsModalOpen(true);
  };

  // Slide navigation
  const goToPrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newIndex = modalIndex === 0 ? productImages.length - 1 : modalIndex - 1;
    setModalIndex(newIndex);
    setSelectedImage(productImages[newIndex]); // Trigger variant selection
  };
  const goToNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newIndex = modalIndex === productImages.length - 1 ? 0 : modalIndex + 1;
    setModalIndex(newIndex);
    setSelectedImage(productImages[newIndex]); // Trigger variant selection
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
    const selectedImg = productImages[idx];
    setSelectedImage(selectedImg); // This will trigger variant selection through the parent component
  };

  return (
    <div className="relative">
      <div className="md:sticky md:top-32 space-y-4">
        <div className="mb-4 border border-gray-200 p-2 bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
          <div
            className="relative h-80 w-full md:h-96 md:w-full flex items-center justify-center bg-gray-50 rounded-lg cursor-zoom-in"
            onClick={handleMainImageClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            tabIndex={0}
            aria-label="Phóng to ảnh sản phẩm"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleMainImageClick();
            }}
            role="button"
          >
            {/* Nút điều hướng trái - chỉ hiển thị trên desktop */}
            <button
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow opacity-100 transition-opacity duration-300"
              onClick={(e) => {
                e.stopPropagation();
                const newIndex = productImages.findIndex((img) => img === selectedImage) === 0
                  ? productImages.length - 1
                  : productImages.findIndex((img) => img === selectedImage) - 1;
                setSelectedImage(productImages[newIndex]);
              }}
              aria-label="Ảnh trước"
              type="button"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <img
              src={selectedImage || productImages[0]}
              alt={productName}
              // Giữ nguyên kích thước chuẩn của ảnh, không crop, không stretch
              className="transition-all duration-500 transform mx-auto w-full h-full object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Nút điều hướng phải - chỉ hiển thị trên desktop */}
            <button
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow opacity-100 transition-opacity duration-300"
              onClick={(e) => {
                e.stopPropagation();
                const newIndex = productImages.findIndex((img) => img === selectedImage) === productImages.length - 1
                  ? 0
                  : productImages.findIndex((img) => img === selectedImage) + 1;
                setSelectedImage(productImages[newIndex]);
              }}
              aria-label="Ảnh tiếp theo"
              type="button"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-3 px-2">
            {(showAllImages ? productImages : productImages.slice(0, IMAGES_PER_PAGE)).map((img: string, index: number) => {
              const isVariantImage = variantImageMap.has(img);
              const variant = variantImageMap.get(img);
              const isSelectedVariantImage = variant && selectedVariant && variant.variantName === selectedVariant.variantName;

              return (
                <div
                  key={index}
                  className={`relative border-1 p-1 cursor-pointer rounded-lg transition-all duration-300 flex items-center justify-center w-full bg-white shadow-sm focus:outline-none ${selectedImage === img
                      ? "border-[#b99f08] ring-2 ring-[#b99f08] shadow-md"
                      : isSelectedVariantImage
                        ? "border-[#b99f08] ring-2 ring-[#b99f08] shadow-md"
                        : "border-gray-200 hover:border-[#b99f08] hover:ring-2 hover:ring-[#b99f08]"
                    }`}
                  onClick={() => setSelectedImage(img)}
                  tabIndex={0}
                  aria-label={`Chọn ảnh ${index + 1}${isVariantImage ? ` - ${variant?.variantName}` : ''}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedImage(img);
                  }}
                >
                  <img
                    src={img}
                    alt={`${productName} - ảnh ${index + 1}${isVariantImage ? ` - ${variant?.variantName}` : ''}`}
                    // Giữ nguyên kích thước chuẩn của ảnh, không crop, không stretch
                    className="rounded transition-transform duration-200 group-hover:scale-105 w-16 h-16 md:w-full md:h-full"
                  />
                  {isVariantImage && (
                    <div className="absolute top-0 right-0 bg-[#b99f08] text-white text-xs px-1 rounded-bl">
                      {variant?.variantName}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {productImages.length > IMAGES_PER_PAGE && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowAllImages(!showAllImages)}
                className="px-4 py-2 text-sm font-medium text-[#b99f08] bg-white border border-[#b99f08] rounded-md hover:bg-[#b99f08] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b99f08]"
              >
                {showAllImages ? 'Thu gọn' : `Xem thêm ${productImages.length - IMAGES_PER_PAGE} ảnh`}
              </button>
            </div>
          )}
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
            className="relative bg-white rounded-lg shadow-lg flex flex-col w-full h-full md:flex-row"
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
            {/* Main image container */}
            <div className="relative flex-1 flex items-center justify-center bg-gray-50">
              {/* Navigation buttons - Responsive positioning */}
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg md:p-3"
                onClick={goToPrev}
                aria-label="Ảnh trước"
                tabIndex={0}
                type="button"
              >
                <svg width="24" height="24" className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24">
                  <path d="M15 19l-7-7 7-7" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  maxWidth: "100%",
                  maxHeight: "calc(100vh - 150px)", // Để lại không gian cho thumbnails
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  const selectedImg = productImages[modalIndex];
                  setSelectedImage(selectedImg);
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={productImages[modalIndex]}
                  alt={`${productName} - ảnh phóng to`}
                  className="rounded max-w-full max-h-full object-contain"
                  style={{
                    background: "#f9fafb",
                  }}
                  draggable={false}
                />
              </div>

              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg md:p-3"
                onClick={goToNext}
                aria-label="Ảnh tiếp theo"
                tabIndex={0}
                type="button"
              >
                <svg width="24" height="24" className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Thumbnails - Responsive layout */}
            <div
              className="flex-none bg-white border-t md:border-l md:border-t-0 border-gray-200"
              style={{
                height: "120px", // Fixed height on mobile
                width: "100%", // Full width on mobile
                [window.innerWidth >= 768 ? "width" : "height"]: window.innerWidth >= 768 ? "160px" : "120px",
              }}
            >
              <div 
                ref={thumbnailsContainerRef}
                className="h-[600px] overflow-x-auto md:overflow-y-auto md:overflow-x-hidden p-2 md:p-4 scroll-smooth"
              >
                <div className="flex md:flex-col gap-2 md:w-full" style={{ minWidth: "max-content" }}>
                  {productImages.map((img, idx) => {
                    const isVariantImage = variantImageMap.has(img);
                    const variant = variantImageMap.get(img);
                    const isSelectedVariantImage = variant && selectedVariant && variant.variantName === selectedVariant.variantName;

                    return (
                      <div
                        key={idx}
                        ref={(el) => {
                          if (el) {
                            thumbnailRefs.current[idx] = el;
                          }
                        }}
                        className={`relative flex-none cursor-pointer rounded-lg transition-all duration-300 flex items-center justify-center 
                          ${modalIndex === idx
                            ? "border-[#b99f08] ring-2 ring-[#b99f08] shadow-md"
                            : isSelectedVariantImage
                              ? "border-[#b99f08] ring-2 ring-[#b99f08] shadow-md"
                              : "border border-gray-200 hover:border-[#b99f08] hover:ring-2 hover:ring-[#b99f08]"
                          }`}
                        style={{
                          width: "90px",
                          height: "90px",
                        }}
                        onClick={() => handleModalThumbClick(idx)}
                      >
                        <img
                          src={img}
                          alt={`${productName} - ảnh ${idx + 1}${isVariantImage ? ` - ${variant?.variantName}` : ''}`}
                          className="rounded-lg w-full h-full object-contain p-1"
                          style={{
                            background: "#f9fafb",
                          }}
                        />
                        {isVariantImage && (
                          <div className="absolute top-0 right-0 bg-[#b99f08] text-white text-[10px] px-1 rounded-bl">
                            {variant?.variantName}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
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
                <path d="M18 6L6 18M6 6l12 12" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImages;
