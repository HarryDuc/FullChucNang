"use client";
import React, { useState, useEffect, FormEvent } from "react";
import "suneditor/dist/css/suneditor.min.css";
import {
  Product,
  VariantAttribute,
  ProductVariant,
  StockInfo,
  Specification,
  SpecificationGroup,
  TechnicalSpec,
} from "../models/product.model";
import { useProducts } from "../hooks/useProducts";
import CategoryTree, { Category } from "./CategoryTree";
import { VariantOptions } from "./VariantOptions";
import Image from "next/image";
import SunEditerUploadImage from "../../common/components/SunEditer";
import { useProductSpecification } from '../hooks/useProductSpecification';
import { useCategoryFilters } from '../hooks/useCategoryFilters';
import ProductFilterSelector from './ProductFilterSelector';

interface SelectedCategory {
  id: string;
  name: string;
}

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
  const { specifications, fetchSpecificationBySlug } = useProductSpecification();

  // Basic Information
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  // const [filters, setFilters] = useState<Record<string, any>>({});
  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };
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

  // Stock Management
  const [stock, setStock] = useState(initialData?.stock || 0);
  const [sold, setSold] = useState(initialData?.sold || 0);
  const [hasVariants, setHasVariants] = useState(
    initialData?.hasVariants || false
  );

  // Images
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || "");
  const [gallery, setGallery] = useState<string[]>(initialData?.gallery || []);

  // State for categories
  const [selectedCategories, setSelectedCategories] = useState<SelectedCategory[]>(
    initialData?.category
      ? [
          { id: initialData.category._id || "", name: initialData.category.main },
          ...(initialData.category.sub || []).map((name: string) => {
            const category = categories.find(c => c.name === name);
            return { id: category?._id || "", name };
          })
        ]
      : []
  );

  // Variants
  const [variantAttributes, setVariantAttributes] = useState<
    VariantAttribute[]
  >(initialData?.variantAttributes || []);
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialData?.variants || []
  );

  // Specifications
  const [specification, setSpecification] = useState<Specification>({
    title: initialData?.specification?.title || "",
    groups: initialData?.specification?.groups || [],
  });

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
  const [seoDescription] = useState(initialData?.seo?.description || "");
  const [seoKeywords] = useState(initialData?.seo?.keywords?.join(", ") || "");

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

  // Khởi tạo filters từ initialData
  const [filters, setFilters] = useState<Record<string, any>>(
    initialData?.filterAttributes || {}
  );

  // Load filters khi có initialData hoặc khi category thay đổi
  useEffect(() => {
    if (initialData?.filterAttributes) {
      console.log('Loading initial filters:', initialData.filterAttributes);
      setFilters(initialData.filterAttributes);
    }
  }, [initialData?.filterAttributes]);

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
      setSelectedCategories([
        { id: initialData.category._id || "", name: initialData.category.main },
        ...(initialData.category.sub || []).map((name: string) => {
          const category = categories.find(c => c.name === name);
          return { id: category?._id || "", name };
        })
      ]);
    }
  }, [initialData?.category]);

  // Handle category change
  const handleCategoryChange = (category: Category, checked: boolean) => {
    setSelectedCategories((prev) => {
      if (checked) {
        // Khi chọn danh mục con, tự động chọn tất cả danh mục cha
        const getAllParentCategories = (childCategory: Category): SelectedCategory[] => {
          if (!childCategory.parentCategory) {
            return [];
          }
          
          const parentCategory = categories.find(cat => cat._id === childCategory.parentCategory);
          if (!parentCategory) {
            return [];
          }
          
          const parentSelected: SelectedCategory = {
            id: parentCategory._id || "",
            name: parentCategory.name
          };
          
          // Đệ quy để lấy tất cả danh mục cha của cha
          return [parentSelected, ...getAllParentCategories(parentCategory)];
        };
        
        const parentCategoriesToAdd = getAllParentCategories(category);
        const categoriesToAdd = [
          { id: category._id || "", name: category.name },
          ...parentCategoriesToAdd
        ];
        
        // Thêm tất cả danh mục mới (tránh trùng lặp)
        const newCategories = [...prev];
        categoriesToAdd.forEach(catToAdd => {
          const exists = newCategories.some(existing => 
            existing.id === catToAdd.id || existing.name === catToAdd.name
          );
          if (!exists) {
            newCategories.push(catToAdd);
          }
        });
        
        return newCategories;
      } else {
        // Khi bỏ chọn danh mục cha, cũng bỏ chọn tất cả danh mục con
        const getAllChildCategories = (parentCategory: Category): SelectedCategory[] => {
          const children = categories.filter(cat => cat.parentCategory === parentCategory._id);
          let allChildren: SelectedCategory[] = [];
          
          for (const child of children) {
            const childSelected: SelectedCategory = {
              id: child._id || "",
              name: child.name
            };
            allChildren.push(childSelected);
            // Đệ quy để lấy tất cả danh mục con của con
            allChildren = [...allChildren, ...getAllChildCategories(child)];
          }
          
          return allChildren;
        };
        
        const childCategoriesToRemove = getAllChildCategories(category);
        const categoriesToRemove = [
          { id: category._id || "", name: category.name },
          ...childCategoriesToRemove
        ];
        
        const newCategories = prev.filter(existing => 
          !categoriesToRemove.some(toRemove => 
            existing.id === toRemove.id || existing.name === toRemove.name
          )
        );
        
        // Chỉ reset filters khi bỏ chọn category cuối cùng
        if (newCategories.length === 0) {
          setFilters({});
        }
        
        return newCategories;
      }
    });
  };

  // Handle variant changes
  const handleVariantAttributesChange = (newAttributes: VariantAttribute[]) => {
    setVariantAttributes(newAttributes);
    // Only update hasVariants if we're adding or removing all attributes
    if (newAttributes.length === 0) {
      setHasVariants(false);
    }
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

    // Tính tổng số lượng tồn kho và đã bán của tất cả biến thể
    const totalStock = updatedVariants.reduce(
      (sum, variant) => sum + (variant.variantStock || 0),
      0
    );
    const totalSold = updatedVariants.reduce(
      (sum, variant) => sum + (variant.variantSold || 0),
      0
    );

    // Cập nhật stock và sold của sản phẩm
    setStock(totalStock);
    setSold(totalSold);

    // Tự động cập nhật trạng thái dựa trên tồn kho
    if (totalStock === 0) {
      setStatus("outOfStock");
    } else if (status === "outOfStock" && totalStock > 0) {
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

    try {
      // Validate required fields
      if (!name || !slug || !basePrice) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc");
      }

      // Validate stock
      if (!hasVariants && stock < 0) {
        throw new Error("Số lượng tồn kho không thể âm");
      }

      // Prepare category data
      const mainCategory = selectedCategories[0]?.name || "";
      const mainCategoryId = selectedCategories[0]?.id || "";
      const subCategories = selectedCategories.slice(1).map(c => c.name);
      const subCategoryIds = selectedCategories.slice(1).map(c => c.id);
      // Prepare product data
      const productData: Partial<Product> = {
        name,
        slug,
        description,
        shortDescription,
        basePrice,
        importPrice,
        currentPrice,
        discountPrice,
        stock,
        sold,
        hasVariants,
        thumbnail,
        gallery,
        status,
        isVisible,
        isFeatured,
        isNewArrival,
        isBestSeller,
        category: {
          main: mainCategory,
          sub: subCategories,
          subCategoryIds: subCategoryIds,
          tags: [],
          _id: mainCategoryId,
          name: mainCategory,
          slug: mainCategory.toLowerCase().replace(/\s+/g, '-'),
        },
        // Thêm filterAttributes vào dữ liệu sản phẩm
        filterAttributes: filters,
        variantAttributes,
        variants,
        specification:
          specification.title || specification.groups.length > 0
            ? specification
            : undefined,
        seo: {
          title: seoTitle,
          description: seoDescription,
          keywords: seoKeywords.split(",").map((k) => k.trim()),
        },
        stockInfo: {
          totalStock: stock,
          lowStockThreshold: stockInfo.lowStockThreshold,
          stockStatus:
            stock === 0
              ? "outOfStock"
              : stock <= (stockInfo.lowStockThreshold || 10)
              ? "lowStock"
              : "inStock",
        },
      };

      console.log('Submitting product with filters:', filters); // Debug log
      await onSubmit(productData);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      setErrorMsg(error instanceof Error ? error.message : "Có lỗi xảy ra");
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
          <SunEditerUploadImage
            postData={shortDescription} 
            setPostData={setShortDescription}
          />
        </div>

        {/* Mô tả sản phẩm */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Mô tả</label>
          <SunEditerUploadImage
            postData={description}
            setPostData={setDescription}
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
            selectedCategoryNames={selectedCategories.map(c => c.name)}
            handleCategoryChange={handleCategoryChange}
          />
        </div>
      </div>

      {/* Bộ lọc sản phẩm - Hiển thị riêng cho từng danh mục */}
      {(() => {
        // Get all selected categories with valid data
        const validCategories = selectedCategories.filter((category) => {
          const categoryData = categories.find(cat => cat._id === category.id || cat.name === category.name);
          return categoryData;
        });
        
        // Filter categories that actually have filters (to avoid showing empty sections)
        const categoriesWithFilters = validCategories.filter((category) => {
          const categoryData = categories.find(cat => cat._id === category.id || cat.name === category.name);
          if (!categoryData) return false;
          
          // Check if this category has filters by using the same logic as ProductFilterSelector
          // We'll simulate the filter check here to avoid rendering empty sections
          return categoryData._id; // For now, include all valid categories and let React handle the filtering
        });
        
        // If no valid categories, don't show the section
        if (categoriesWithFilters.length === 0) return null;
        
        return (
          <div className="bg-white rounded-xl shadow p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3">
              Bộ lọc sản phẩm ({categoriesWithFilters.length} danh mục)
            </h2>
            
            <div className="space-y-6">
              {categoriesWithFilters.map((category) => {
                const categoryData = categories.find(cat => cat._id === category.id || cat.name === category.name);
                if (!categoryData) return null;
                
                // Build breadcrumb for this specific category
                const buildCategoryBreadcrumb = (cat: Category) => {
                  const breadcrumbs: string[] = [];
                  let currentCat: Category | undefined = cat;
                  
                  // Build breadcrumb from current category up to root
                  while (currentCat) {
                    breadcrumbs.unshift(currentCat.name);
                    if (currentCat.parentCategory) {
                      currentCat = categories.find(c => c._id === currentCat!.parentCategory);
                    } else {
                      break;
                    }
                  }
                  
                  return breadcrumbs.join(' > ');
                };
                
                // Create inline component to check if category has filters
                const CategoryFilterWrapper = ({ categoryData, filters, onFilterChange, buildCategoryBreadcrumb }: any) => {
                  const { filters: categoryFilters, loading, error } = useCategoryFilters(categoryData._id);
                  
                  // Don't render if no categoryId, loading, error, or no filters
                  if (!categoryData._id || loading || error || !categoryFilters?.length) {
                    return null;
                  }
                  
                  return (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-700">Danh mục</h3>
                        <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                          <span className="font-medium">
                            {buildCategoryBreadcrumb(categoryData)}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <ProductFilterSelector
                          categoryId={categoryData._id}
                          selectedFilters={filters}
                          onChange={onFilterChange}
                        />
                      </div>
                    </div>
                  );
                };
                
                return (
                  <CategoryFilterWrapper
                    key={category.id}
                    categoryData={categoryData}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    buildCategoryBreadcrumb={buildCategoryBreadcrumb}
                  />
                );
              }).filter(Boolean)}
            </div>
          </div>
        );
      })()}

      {/* Stock Management Section */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h3 className="text-lg font-medium">Quản lý tồn kho</h3>

        <div className="flex items-center space-x-4 mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={hasVariants}
              onChange={(e) => {
                const newHasVariants = e.target.checked;
                setHasVariants(newHasVariants);
                if (!newHasVariants) {
                  setVariantAttributes([]);
                  setVariants([]);
                }
              }}
              className="mr-2"
            />
            Sản phẩm có biến thể
          </label>
        </div>

        {!hasVariants && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">
                Số lượng tồn kho
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setStock(value);
                  // Cập nhật trạng thái dựa trên tồn kho
                  if (value === 0) {
                    setStatus("outOfStock");
                  } else if (status === "outOfStock" && value > 0) {
                    setStatus("published");
                  }
                }}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Đã bán</label>
              <input
                type="number"
                value={sold}
                onChange={(e) => setSold(parseInt(e.target.value))}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Variant Management Section */}
      {hasVariants && (
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <h3 className="text-lg font-medium">Quản lý biến thể</h3>
          <VariantOptions
            initialAttributes={variantAttributes}
            initialVariants={variants}
            onAttributesChange={handleVariantAttributesChange}
            onVariantsChange={handleVariantsChange}
          />
        </div>
      )}

      {/* Thông số kỹ thuật */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h3 className="text-lg font-bold mb-2">Thông số kỹ thuật</h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Chọn template thông số kỹ thuật</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded"
              onChange={async (e) => {
                const slug = e.target.value;
                if (slug) {
                  const spec = await fetchSpecificationBySlug(slug);
                  if (spec) {
                    setSpecification({
                      title: spec.title,
                      groups: spec.groups.map((group: any) => ({
                        title: group.title,
                        specs: group.specs
                      }))
                    });
                  }
                }
              }}
            >
              <option value="">-- Chọn template --</option>
              {specifications.map((spec) => (
                <option key={spec._id} value={spec.slug}>
                  {spec.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Tiêu đề chung</label>
            <input
              type="text"
              value={specification.title}
              onChange={(e) =>
                setSpecification((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="Ví dụ: Thông số kỹ thuật"
            />
          </div>

          {specification.groups.map((group, groupIndex) => (
            <div key={groupIndex} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block mb-1">Tiêu đề nhóm</label>
                  <input
                    type="text"
                    value={group.title}
                    onChange={(e) => {
                      const newGroups = [...specification.groups];
                      newGroups[groupIndex].title = e.target.value;
                      setSpecification((prev) => ({
                        ...prev,
                        groups: newGroups,
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    placeholder="Ví dụ: Kích thước & Trọng lượng"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newGroups = specification.groups.filter(
                      (_, i) => i !== groupIndex
                    );
                    setSpecification((prev) => ({
                      ...prev,
                      groups: newGroups,
                    }));
                  }}
                  className="ml-2 px-2 py-2 text-red-600 hover:text-red-800"
                >
                  Xóa nhóm
                </button>
              </div>

              <div className="space-y-2">
                {group.specs.map((spec, specIndex) => (
                  <div key={specIndex} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={spec.name}
                        onChange={(e) => {
                          const newGroups = [...specification.groups];
                          newGroups[groupIndex].specs[specIndex].name =
                            e.target.value;
                          setSpecification((prev) => ({
                            ...prev,
                            groups: newGroups,
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="Tên thông số"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => {
                          const newGroups = [...specification.groups];
                          newGroups[groupIndex].specs[specIndex].value =
                            e.target.value;
                          setSpecification((prev) => ({
                            ...prev,
                            groups: newGroups,
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="Giá trị"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newGroups = [...specification.groups];
                        newGroups[groupIndex].specs = newGroups[
                          groupIndex
                        ].specs.filter((_, i) => i !== specIndex);
                        setSpecification((prev) => ({
                          ...prev,
                          groups: newGroups,
                        }));
                      }}
                      className="px-2 py-2 text-red-600 hover:text-red-800"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newGroups = [...specification.groups];
                    newGroups[groupIndex].specs.push({ name: "", value: "" });
                    setSpecification((prev) => ({
                      ...prev,
                      groups: newGroups,
                    }));
                  }}
                  className="mt-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  + Thêm thông số
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              setSpecification((prev) => ({
                ...prev,
                groups: [
                  ...prev.groups,
                  { title: "", specs: [], _id: undefined },
                ],
              }));
            }}
            className="mt-4 px-4 py-2 text-sm bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-100"
          >
            + Thêm nhóm thông số
          </button>
        </div>
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
      <div className="fixed bottom-6 right-6 z-50 flex justify-end gap-4">
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
