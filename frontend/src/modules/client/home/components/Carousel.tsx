"use client";

import { useState, useEffect, useCallback } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useBanner } from "../hooks/useBanner";

const bannersPerPage = 2;

const Carousel = () => {
  const { useGetActiveBanners } = useBanner();
  const { data: banners = [], isLoading } = useGetActiveBanners("main");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);

  const minSwipeDistance = 50;
  const totalPages = Math.ceil((banners?.length || 0) / bannersPerPage);

  // Calculate current page
  const currentPage = Math.floor(currentIndex / bannersPerPage);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isDragging && banners.length > 0) {
        handleNext();
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex, isDragging, banners.length]);

  const handleSlideChange = useCallback(
    (direction: "next" | "prev") => {
      if (!isTransitioning && banners.length > 0) {
        setIsTransitioning(true);
        setCurrentIndex((prev) => {
          if (direction === "next") {
            return (prev + bannersPerPage) % banners.length;
          } else {
            return (prev - bannersPerPage + banners.length) % banners.length;
          }
        });
        setTimeout(() => setIsTransitioning(false), 500);
      }
    },
    [isTransitioning, banners.length]
  );

  const handleNext = () => handleSlideChange("next");
  const handlePrev = () => handleSlideChange("prev");

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) handleNext();
    if (distance < -minSwipeDistance) handlePrev();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTouchEnd(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    const distance = dragStart - touchEnd;
    if (distance > minSwipeDistance) handleNext();
    if (distance < -minSwipeDistance) handlePrev();
    setIsDragging(false);
  };

  const handleMouseLeave = () => setIsDragging(false);

  // Get the banners to display (handle wrap-around)
  const getVisibleBanners = () => {
    if (!banners.length) return [];

    if (currentIndex + bannersPerPage <= banners.length) {
      return banners.slice(currentIndex, currentIndex + bannersPerPage);
    }
    // Wrap around
    return [
      ...banners.slice(currentIndex, banners.length),
      ...banners.slice(0, (currentIndex + bannersPerPage) % banners.length),
    ];
  };

  if (isLoading) {
    return (
      <section className="relative w-full h-[330px] bg-gray-100 animate-pulse rounded-lg">
        <div className="w-full h-full flex gap-4 px-4 py-4">
          <div className="flex-1 bg-gray-200 rounded-2xl" />
          <div className="flex-1 bg-gray-200 rounded-2xl" />
        </div>
      </section>
    );
  }

  if (!banners.length) {
    return null;
  }

  return (
    <section
      className="relative w-full h-[330px] overflow-hidden"
      aria-label="Carousel banner khuyến mãi"
    >
      {/* Slides wrapper */}
      <div
        className="relative w-full h-full flex"
        style={{
          transform: `translateX(0%)`,
          transition: isDragging
            ? "none"
            : "transform 0.5s cubic-bezier(0.4,0,0.2,1)",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex w-full min-w-full h-full gap-4 px-4 py-4 bg-white rounded-lg">
          {getVisibleBanners().map((banner) => (
            <section
              key={banner._id}
              className="flex-1 rounded-2xl shadow-lg relative overflow-hidden"
              tabIndex={0}
              aria-label={banner.title || "Banner"}
              role="region"
            >
              {/* Banner image */}
              <img
                src={banner.imagePath}
                alt={banner.title || "Banner"}
                className="w-full h-full object-cover mb-6 pointer-events-none select-none"
                draggable={false}
              />
              {/* Banner content overlay */}
              {(banner.title || banner.description) && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-30 text-white">
                  {banner.title && (
                    <h3 className="text-lg font-semibold mb-1">
                      {banner.title}
                    </h3>
                  )}
                  {banner.description && (
                    <p className="text-sm line-clamp-2">{banner.description}</p>
                  )}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white transition-colors flex items-center justify-center z-10"
        aria-label="Slide trước"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handlePrev();
        }}
      >
        <IoIosArrowBack className="w-5 h-5 text-gray-800" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white transition-colors flex items-center justify-center z-10"
        aria-label="Slide kế tiếp"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleNext();
        }}
      >
        <IoIosArrowForward className="w-5 h-5 text-gray-800" />
      </button>

      {/* Dots indicator */}
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10"
        role="tablist"
        aria-label="Chuyển slide"
      >
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index * bannersPerPage)}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentPage === index ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Chuyển đến slide ${index + 1}`}
            aria-selected={currentPage === index}
            role="tab"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                setCurrentIndex(index * bannersPerPage);
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default Carousel;
