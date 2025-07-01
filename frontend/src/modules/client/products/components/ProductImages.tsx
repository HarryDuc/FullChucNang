import React from "react";

interface ProductImagesProps {
  productImages: string[];
  selectedImage: string;
  setSelectedImage: (img: string) => void;
  productName: string;
}

const ProductImages: React.FC<ProductImagesProps> = ({
  productImages,
  selectedImage,
  setSelectedImage,
  productName,
}) => {
  return (
    <div className="relative">
      <div className="md:sticky md:top-32 space-y-4">
        <div className="mb-4 border border-gray-200 p-2 bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
          <div className="relative h-96 w-full flex items-center justify-center bg-gray-50 rounded-lg">
            <img
              src={selectedImage || productImages[0]}
              alt={productName}
              className="object-contain transition-all duration-500 transform hover:scale-105 max-h-96 mx-auto"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
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
    </div>
  );
};

export default ProductImages;
