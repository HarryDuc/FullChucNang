"use client";
import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import {
  Product,
  VariantAttribute,
  ProductVariant,
  StockInfo,
} from "../models/product.model";
import { useProducts } from "../hooks/useProducts";
import CategoryTree, { Category } from "./CategoryTree";
import { VariantOptions } from "./VariantOptions";
import Image from "next/image";

interface ProductFormProps {
  initialData?: Product;
  mode: "create" | "edit";
  onSubmit: (productData: Partial<Product>) => Promise<void>;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  mode,
  onSubmit,
  onCancel,
}): React.ReactElement => {
  const { categories, uploadImage } = useProducts();

  // Basic Information
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [shortDescription, setShortDescription] = useState(
    initialData?.shortDescription || ""
  );

  // Pricing
  const [basePrice, setBasePrice] = useState(initialData?.basePrice || 0);
  const [importPrice, setImportPrice] = useState(initialData?.importPrice || 0);
  const [currentPrice, setCurrentPrice] = useState(
    initialData?.currentPrice || 0
  );
  const [discountPrice, setDiscountPrice] = useState(
    initialData?.discountPrice || 0
  );

  // Images
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || "");
  const [gallery, setGallery] = useState<string[]>(initialData?.gallery || []);

  // State for categories
  const [selectedCategoryNames, setSelectedCategoryNames] = useState<string[]>(
    initialData?.category
      ? [initialData.category.main, ...(initialData.category.sub || [])]
      : []
  );

  // Variants
  const [variantAttributes, setVariantAttributes] = useState<
    VariantAttribute[]
  >(initialData?.variantAttributes || []);
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialData?.variants || []
  );

  // Status and Visibility
  const [status, setStatus] = useState<
    "draft" | "published" | "archived" | "outOfStock" | "comingSoon"
  >(initialData?.status || "draft");
  const [isVisible, setIsVisible] = useState(initialData?.isVisible || false);
  const [isFeatured, setIsFeatured] = useState(
    initialData?.isFeatured || false
  );
  const [isNewArrival, setIsNewArrival] = useState(
    initialData?.isNewArrival || false
  );
  const [isBestSeller, setIsBestSeller] = useState(
    initialData?.isBestSeller || false
  );

  // SEO
  const [seoTitle] = useState(initialData?.seo?.title || "");
  const [seoDescription] = useState(
    initialData?.seo?.description || ""
  );
  const [seoKeywords] = useState(
    initialData?.seo?.keywords?.join(", ") || ""
  );

  // Stock Info
  const [stockInfo] = useState<StockInfo>(
    initialData?.stockInfo || {
      totalStock: 0,
      lowStockThreshold: 10,
      stockStatus: "inStock",
    }
  );

  // UI State
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Tự động tạo slug từ name
  useEffect(() => {
    if (mode === "create" && !initialData?.slug && name) {
      const generatedSlug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generatedSlug);
    }
  }, [name, mode, initialData?.slug]);

  useEffect(() => {
    if (initialData?.category) {
      setSelectedCategoryNames([
        initialData.category.main,
        ...(initialData.category.sub || []),
      ]);
    }
  }, [initialData?.category]);

  // Handle category selection
  const handleCategoryChange = (category: Category, checked: boolean) => {
    setSelectedCategoryNames((prev) => {
      if (checked) {
        return [...prev, category.name];
      }
      return prev.filter((name) => name !== category.name);
    });
  };

  // Handle variant changes
  const handleVariantAttributesChange = (newAttributes: VariantAttribute[]) => {
    setVariantAttributes(newAttributes);
  };

  const handleVariantsChange = (newVariants: ProductVariant[]) => {
    // Ensure all variant fields are preserved
    const updatedVariants = newVariants.map((variant) => ({
      ...variant,
      sku: variant.sku || "",
      variantStock: variant.variantStock || 0,
      variantSold: variant.variantSold || 0,
      variantGalleries: variant.variantGalleries || [],
      variantImportPrice: variant.variantImportPrice || 0,
      variantCurrentPrice: variant.variantCurrentPrice || 0,
      variantDiscountPrice: variant.variantDiscountPrice || 0,
    }));

    // Tính tổng số lượng tồn kho của tất cả biến thể
    const totalStock = updatedVariants.reduce(
      (sum, variant) => sum + (variant.variantStock || 0),
      0
    );

    // Tự động cập nhật trạng thái nếu tổng tồn kho = 0
    if (totalStock === 0) {
      setStatus("outOfStock");
    } else if (status === "outOfStock" && totalStock > 0) {
      // Nếu đang là hết hàng mà có tồn kho thì chuyển về published
      setStatus("published");
    }

    setVariants(updatedVariants);
  };

  // Handle image upload
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      setIsUploadingImages(true);
      const imageUrl = await uploadImage(file);
      setIsUploadingImages(false);
      return imageUrl || "";
    } catch (error) {
      console.log(error);
      setIsUploadingImages(false);
      setErrorMsg("Lỗi khi tải ảnh lên");
      return "";
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    console.log("Form data before validation:", {
      name,
      slug,
      description,
      shortDescription,
      importPrice,
      currentPrice,
      discountPrice,
      thumbnail,
      gallery,
      selectedCategoryNames,
      variantAttributes,
      variants,
      stockInfo,
      status,
      isVisible,
      isFeatured,
      isNewArrival,
      isBestSeller,
      seoTitle,
      seoDescription,
      seoKeywords,
    });

    // Validate required fields
    if (!name.trim()) {
      setErrorMsg("Vui lòng nhập tên sản phẩm");
      setIsSubmitting(false);
      return;
    }

    if (!slug.trim()) {
      setErrorMsg("Vui lòng nhập slug sản phẩm");
      setIsSubmitting(false);
      return;
    }

    if (!basePrice || basePrice <= 0) {
      setErrorMsg("Vui lòng nhập giá cơ bản hợp lệ");
      setIsSubmitting(false);
      return;
    }

    if (!currentPrice || currentPrice <= 0) {
      setErrorMsg("Vui lòng nhập giá bán hợp lệ");
      setIsSubmitting(false);
      return;
    }

    // Validate variants if they exist
    if (variants.length > 0) {
      console.log("Validating variants:", variants);
      const invalidVariant = variants.find(
        (v) => !v.variantName || !v.combination || v.combination.length === 0
      );
      if (invalidVariant) {
        console.error("Invalid variant found:", invalidVariant);
        setErrorMsg("Thông tin biến thể không hợp lệ");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Prepare category data
      const mainCategory = selectedCategoryNames[0] || "";
      const subCategories = selectedCategoryNames.slice(1);

      console.log("Category data:", {
        mainCategory,
        subCategories,
        selectedCategoryNames,
      });

      // Validate category
      if (!mainCategory) {
        setErrorMsg("Vui lòng chọn danh mục chính cho sản phẩm");
        setIsSubmitting(false);
        return;
      }

      const productData: Partial<Product> = {
        name: name.trim(),
        ...(mode === "create" ? { slug: slug.trim() } : {}),
        description,
        shortDescription: shortDescription.trim(),
        basePrice: basePrice || 0,
        importPrice: importPrice || 0,
        currentPrice: currentPrice || 0,
        discountPrice: discountPrice || 0,
        thumbnail,
        gallery,
        category: {
          main: mainCategory,
          sub: subCategories,
          tags: [],
        },
        variantAttributes,
        variants: variants.map((variant) => ({
          ...variant,
          variantName: variant.variantName.trim(),
          sku: variant.sku?.trim() || "",
          variantStock: variant.variantStock || 0,
          variantSold: variant.variantSold || 0,
          variantGalleries: variant.variantGalleries || [],
          variantImportPrice: variant.variantImportPrice || 0,
          variantCurrentPrice: variant.variantCurrentPrice || 0,
          variantDiscountPrice: variant.variantDiscountPrice || 0,
        })),
        stockInfo,
        status,
        isVisible,
        isFeatured,
        isNewArrival,
        isBestSeller,
        seo: {
          title: seoTitle.trim(),
          description: seoDescription.trim(),
          keywords: seoKeywords
            .split(",")
            .map((k) => k.trim())
            .filter((k) => k),
        },
      };

      console.log("Final product data being sent:", productData);

      await onSubmit(productData);
      setIsSubmitting(false);
    } catch (error: any) {
      console.error("Form submission error:", error);
      setIsSubmitting(false);
      console.log(error);
      if (error.response) {
        console.error("Error response:", await error.response.text());
      }
      setErrorMsg(error.message || "Có lỗi xảy ra khi lưu sản phẩm");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errorMsg && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg shadow">
          {errorMsg}
        </div>
      )}

      {/* Thông tin cơ bản */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h3 className="text-lg font-bold mb-2">Thông tin cơ bản</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Tên sản phẩm</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
          {mode === "create" ? (
            <div>
              <label className="block mb-1">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block mb-1">Slug (không thể thay đổi)</label>
              <input
                type="text"
                value={slug}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
                disabled
              />
            </div>
          )}
        </div>

        <div>
          <label className="block mb-1">Mô tả ngắn</label>
          <textarea
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            rows={3}
          />
        </div>

        <div>
          <label className="block mb-1">Mô tả chi tiết</label>
          <SunEditor
            setContents={description}
            onChange={setDescription}
            height="300px"
          />
        </div>
      </div>

      {/* Giá sản phẩm */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h3 className="text-lg font-bold mb-2">Giá sản phẩm</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block mb-1">Giá cơ bản</label>
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Giá nhập</label>
            <input
              type="number"
              value={importPrice}
              onChange={(e) => setImportPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Giá bán</label>
            <input
              type="number"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Giá khuyến mãi</label>
            <input
              type="number"
              value={discountPrice}
              onChange={(e) => setDiscountPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Hình ảnh */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h3 className="text-lg font-bold mb-2">Hình ảnh</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Ảnh đại diện</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = await handleImageUpload(file);
                  if (url) setThumbnail(url);
                }
              }}
              className="w-full"
            />
            {thumbnail && (
              <Image
                src={thumbnail}
                alt="Thumbnail"
                className="mt-2 w-32 h-32 object-cover"
                width={128}
                height={128}
              />
            )}
          </div>
          <div>
            <label className="block mb-1">Thư viện ảnh</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                const urls = await Promise.all(
                  files.map((file) => handleImageUpload(file))
                );
                setGallery([...gallery, ...urls.filter((url) => url)]);
              }}
              className="w-full"
            />
            <div className="grid grid-cols-4 gap-2 mt-2">
              {gallery.map((url, index) => (
                <div key={index} className="relative">
                  <Image
                    src={url}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-24 object-cover"
                    width={96}
                    height={96}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setGallery(gallery.filter((_, i) => i !== index))
                    }
                    className="absolute top-0 right-0 bg-red-600 text-white p-1 text-xs"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Danh mục */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h3 className="text-lg font-bold mb-2">Danh mục sản phẩm</h3>
        <div className="border rounded-lg p-4">
          <CategoryTree
            categories={categories}
            selectedCategoryNames={selectedCategoryNames}
            handleCategoryChange={handleCategoryChange}
          />
        </div>
      </div>

      {/* Biến thể */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <VariantOptions
          initialAttributes={variantAttributes}
          initialVariants={variants}
          onAttributesChange={handleVariantAttributesChange}
          onVariantsChange={handleVariantsChange}
        />
      </div>

      {/* Trạng thái */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h3 className="text-lg font-bold mb-2">Trạng thái & hiển thị</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Trạng thái</label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as
                    | "draft"
                    | "published"
                    | "archived"
                    | "outOfStock"
                    | "comingSoon"
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="draft">Nháp</option>
              <option value="published">Đã xuất bản</option>
              <option value="archived">Đã lưu trữ</option>
              <option value="outOfStock">Hết hàng</option>
              <option value="comingSoon">Sắp có hàng</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="form-checkbox"
              />
              <span>Ẩn sản phẩm</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="form-checkbox"
              />
              <span>Sản phẩm nổi bật</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="form-checkbox"
              />
              <span>Sản phẩm mới</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="form-checkbox"
              />
              <span>Sản phẩm bán chạy</span>
            </label>
          </div>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
          disabled={isSubmitting || isUploadingImages}
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          disabled={isSubmitting || isUploadingImages}
        >
          {isSubmitting
            ? "Đang lưu..."
            : mode === "create"
            ? "Tạo sản phẩm"
            : "Cập nhật"}
        </button>
      </div>
    </form>
  );
};
