"use client";

import { useBanner } from "../hooks/useBanner";

// Component hiển thị gallery ảnh theo tỷ lệ 2:1
const ImageGallery = () => {
  const { useGetActiveBanners } = useBanner();
  const { data: banners = [], isLoading, error } = useGetActiveBanners("sub");

  if (isLoading) {
    return (
      <div className="w-full h-[400px] grid grid-cols-6 gap-4 animate-pulse">
        <div className="col-span-6 min-[722px]:col-span-4 bg-gray-200 h-[390px]" />
        <div className="col-span-2 hidden min-[822px]:block bg-gray-200 h-[390px]" />
      </div>
    );
  }

  if (error || !banners.length) {
    return null;
  }

  return (
    <div className="w-full h-[400px] grid grid-cols-6 gap-4">
      {/* Ảnh thứ nhất: full width (col-span-6) từ <=821, và 4/6 (col-span-4) từ 822px trở lên */}
      <div className="relative col-span-6 min-[722px]:col-span-4">
        {banners[0] && (
          <img
            src={banners[0].imagePath}
            alt={banners[0].title}
            className="w-full h-[390px] object-cover"
            loading="lazy"
          />
        )}
      </div>

      {/* Ảnh thứ hai: ẩn ở <=821px, hiển thị 2/6 (col-span-2) từ 822px trở lên */}
      <div className="relative col-span-2 hidden min-[822px]:block">
        {banners[1] && (
          <img
            src={banners[1].imagePath}
            alt={banners[1].title}
            className="w-full h-[390px] object-cover"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
};

export default ImageGallery;
