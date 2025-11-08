"use client";
import React, { useState, useEffect, FormEvent } from "react";
import "suneditor/dist/css/suneditor.min.css";
import {
  Product,
  VariantAttribute,
  ProductVariant,
  StockInfo,
  Specification,
} from "../models/product.model";
import { useProducts } from "../hooks/useProducts";
import CategoryTree, { Category } from "./CategoryTree";
import { VariantOptions } from "./VariantOptions";
import SunEditerUploadImage from "../../common/components/SunEditer";
import {
  getFiltersByCategory,
  CategoryFilter,
} from "../hooks/useCategoryFilters";
import { specificationService } from "../services/specification.service";
import { useProductSpecification } from "../hooks/useProductSpecification";
import SunEditerForSpecification from "../../common/components/SunEditerForSpecification";

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

  // Basic Information
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [showSlugEdit, setShowSlugEdit] = useState(false);
  const [publishedDate, setPublishedDate] = useState<string>("");
  const [publishedTime, setPublishedTime] = useState<string>("");
  const [isLoadingSpecifications, setIsLoadingSpecifications] = useState(false);
  const [specification, setSpecification] = useState<Specification>(
    initialData?.specification || { title: "", groups: [] }
  );
  const [autoPopulatedCategories, setAutoPopulatedCategories] = useState<
    string[]
  >([]);

  // Khởi tạo filters từ initialData
  const [filters, setFilters] = useState<Record<string, any>>(
    initialData?.filterAttributes || {}
  );

  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [shortDescription, setShortDescription] = useState(
    initialData?.shortDescription || ""
  );

  const [importPrice, setImportPrice] = useState(initialData?.importPrice || 0);
  const [currentPrice, setCurrentPrice] = useState(
    initialData?.currentPrice || 0
  );
  const [discountPrice, setDiscountPrice] = useState(
    initialData?.discountPrice || 0
  );
  const { specifications, fetchSpecificationBySlug } =
    useProductSpecification();
  const [specificationDescription, setSpecificationDescription] = useState(
    initialData?.specificationDescription || ""
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
  const [selectedCategories, setSelectedCategories] = useState<
    SelectedCategory[]
  >([]);
  // Set default date and time on mount
  useEffect(() => {
    const now = new Date();
    if (initialData?.updatedAt) {
      const pubDate = new Date(initialData.updatedAt);
      if (!isNaN(pubDate.getTime())) {
        setPublishedDate(pubDate.toISOString().split("T")[0]);
        const utcHour = pubDate.getUTCHours();
        const minutes = pubDate.getUTCMinutes().toString().padStart(2, "0");
        setPublishedTime(`${utcHour.toString().padStart(2, "0")}:${minutes}`);
      } else {
        // Fallback to now if invalid date
        setPublishedDate(now.toISOString().split("T")[0]);
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        setPublishedTime(`${hours}:${minutes}`);
      }
    } else {
      setPublishedDate(now.toISOString().split("T")[0]);
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setPublishedTime(`${hours}:${minutes}`);
    }
  }, [initialData?.updatedAt]);
  // Auto-fetch and populate specification templates when categories change
  useEffect(() => {
    const fetchSpecificationTemplates = async () => {
      if (selectedCategories.length === 0) {
        setAutoPopulatedCategories([]);
        return;
      }

      setIsLoadingSpecifications(true);
      try {
        // Fetch specifications for all selected categories
        const specificationPromises = selectedCategories.map(
          async (category) => {
            if (!category.id) return null;
            try {
              const specs = await specificationService.getByCategoryId(
                category.id
              );
              return {
                categoryId: category.id,
                categoryName: category.name,
                specs,
              };
            } catch (error) {
              console.log(
                `No specifications found for category ${category.name}:`,
                error
              );
              return null;
            }
          }
        );

        const results = await Promise.all(specificationPromises);
        const validResults = results.filter(
          (result) => result && result.specs && result.specs.length > 0
        );

        if (validResults.length > 0) {
          // If we have specifications from any category, merge them
          let mergedSpecification: Specification = {
            title: "Thông số kỹ thuật",
            groups: [],
          };

          validResults.forEach((result) => {
            if (result && result.specs) {
              result.specs.forEach((spec: any) => {
                if (spec.groups && spec.groups.length > 0) {
                  // Add category prefix to group titles to avoid confusion
                  const prefixedGroups = spec.groups.map((group: any) => ({
                    ...group,
                    title: `${result.categoryName} - ${group.title || "Thông số"
                      }`,
                    specs: group.specs || [],
                  }));
                  mergedSpecification.groups.push(...prefixedGroups);
                }
              });
            }
          });

          // Only update if we don't already have specification data or if it's empty
          if (!specification.title && specification.groups.length === 0) {
            setSpecification(mergedSpecification);
            setAutoPopulatedCategories(
              validResults.map((r) => r?.categoryName || "")
            );
            console.log(
              "Auto-populated specification templates for categories:",
              validResults.map((r) => r?.categoryName)
            );
          }
        } else {
          setAutoPopulatedCategories([]);
        }
      } catch (error) {
        console.error("Error fetching specification templates:", error);
        setAutoPopulatedCategories([]);
      } finally {
        setIsLoadingSpecifications(false);
      }
    };

    // Only fetch if we're in create mode or if specification is empty
    if (
      mode === "create" ||
      (!specification.title && specification.groups.length === 0)
    ) {
      fetchSpecificationTemplates();
    }
  }, [selectedCategories, mode]); // Dependencies: selectedCategories and mode

  // Manual refresh function for specification templates
  const handleRefreshSpecificationTemplates = async () => {
    if (selectedCategories.length === 0) {
      return;
    }

    setIsLoadingSpecifications(true);
    try {
      // Fetch specifications for all selected categories
      const specificationPromises = selectedCategories.map(async (category) => {
        if (!category.id) return null;
        try {
          const specs = await specificationService.getByCategoryId(category.id);
          return {
            categoryId: category.id,
            categoryName: category.name,
            specs,
          };
        } catch (error) {
          console.log(
            `No specifications found for category ${category.name}:`,
            error
          );
          return null;
        }
      });

      const results = await Promise.all(specificationPromises);
      const validResults = results.filter(
        (result) => result && result.specs && result.specs.length > 0
      );

      if (validResults.length > 0) {
        // If we have specifications from any category, merge them
        let mergedSpecification: Specification = {
          title: "Thông số kỹ thuật",
          groups: [],
        };

        validResults.forEach((result) => {
          if (result && result.specs) {
            result.specs.forEach((spec: any) => {
              if (spec.groups && spec.groups.length > 0) {
                // Add category prefix to group titles to avoid confusion
                const prefixedGroups = spec.groups.map((group: any) => ({
                  ...group,
                  title: `${result.categoryName} - ${group.title || "Thông số"
                    }`,
                  specs: group.specs || [],
                }));
                mergedSpecification.groups.push(...prefixedGroups);
              }
            });
          }
        });

        // Force update specification templates
        setSpecification(mergedSpecification);
        setAutoPopulatedCategories(
          validResults.map((r) => r?.categoryName || "")
        );
        console.log(
          "Manually refreshed specification templates for categories:",
          validResults.map((r) => r?.categoryName)
        );
      } else {
        setAutoPopulatedCategories([]);
        // Clear specifications if no templates found
        setSpecification({ title: "", groups: [] });
      }
    } catch (error) {
      console.error("Error refreshing specification templates:", error);
      setAutoPopulatedCategories([]);
    } finally {
      setIsLoadingSpecifications(false);
    }
  };

  useEffect(() => {
    if (initialData?.category && categories.length > 0) {
      const mainCategory = categories.find(
        (c) => c.name === initialData?.category?.main
      );
      const subCategories = (initialData?.category?.sub || [])
        .map((name: string) => {
          return categories.find((c) => c.name === name);
        })
        .filter(Boolean);

      const updatedCategories: SelectedCategory[] = [];

      // Thêm main category
      if (mainCategory) {
        updatedCategories.push({
          id: mainCategory._id || "",
          name: mainCategory.name,
        });
      }

      // Thêm sub categories
      subCategories.forEach((cat) => {
        if (cat) {
          updatedCategories.push({
            id: cat._id || "",
            name: cat.name,
          });
        }
      });

      console.log("Setting selectedCategories:", updatedCategories);
      setSelectedCategories(updatedCategories);
    } else if (!initialData?.category) {
      setSelectedCategories([]);
    }
  }, [initialData?.category, categories]);

  // Variants
  const [variantAttributes, setVariantAttributes] = useState<
    VariantAttribute[]
  >(initialData?.variantAttributes || []);
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialData?.variants || []
  );

  // Lưu trữ tạm thời các giá trị biến thể
  const [tempVariantAttributes, setTempVariantAttributes] = useState<
    VariantAttribute[]
  >([]);
  const [tempVariants, setTempVariants] = useState<ProductVariant[]>([]);

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

  // State lưu filter options theo category
  const [categoryFilterOptions, setCategoryFilterOptions] = useState<
    CategoryFilter[]
  >([]);

  // Cache để lưu filter options đã fetch
  const [filterOptionsCache, setFilterOptionsCache] = useState<
    Record<string, CategoryFilter[]>
  >({});

  // Fetch filter options khi đổi category (chỉ lấy theo category đầu tiên)
  useEffect(() => {
    const fetchCategoryFilters = async () => {
      console.log(
        "fetchCategoryFilters called with selectedCategories:",
        selectedCategories
      );
      if (selectedCategories.length === 0 || !selectedCategories[0].id) {
        console.log(
          "No selected categories or no category ID, clearing filter options"
        );
        setCategoryFilterOptions([]);
        return;
      }

      const categoryId = selectedCategories[0].id;
      console.log("Fetching filters for categoryId:", categoryId);

      // Kiểm tra cache trước
      if (filterOptionsCache[categoryId]) {
        console.log("Using cached filter options for categoryId:", categoryId);
        setCategoryFilterOptions(filterOptionsCache[categoryId]);
        return;
      }

      try {
        const data = await getFiltersByCategory(categoryId);
        console.log("Fetched filter data:", data);
        // Lưu vào cache
        setFilterOptionsCache((prev) => ({
          ...prev,
          [categoryId]: data,
        }));
        setCategoryFilterOptions(data);
      } catch (err) {
        console.error("Error fetching filters:", err);
        setCategoryFilterOptions([]);
      }
    };
    fetchCategoryFilters();
  }, [selectedCategories]); // Remove filterOptionsCache from dependencies to avoid loop

  // Load filters khi có initialData hoặc khi category thay đổi
  useEffect(() => {
    if (initialData?.filterAttributes) {
      console.log("Loading initial filters:", initialData.filterAttributes);
      setFilters(initialData.filterAttributes);
    }
  }, [initialData?.filterAttributes]);

  // Xử lý lưu và khôi phục giá trị biến thể khi toggle hasVariants
  useEffect(() => {
    if (!hasVariants) {
      // Lưu giá trị hiện tại vào temp khi tắt biến thể
      setTempVariantAttributes(variantAttributes);
      setTempVariants(variants);
    } else {
      // Khôi phục giá trị từ temp khi bật lại biến thể
      if (tempVariantAttributes.length > 0) {
        setVariantAttributes(tempVariantAttributes);
      }
      if (tempVariants.length > 0) {
        setVariants(tempVariants);
      }
    }
  }, [hasVariants]);

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

  // Handle category change
  const handleCategoryChange = (category: Category, checked: boolean) => {
    setSelectedCategories((prev) => {
      if (checked) {
        // Khi chọn danh mục con, tự động chọn tất cả danh mục cha
        const getAllParentCategories = (
          childCategory: Category
        ): SelectedCategory[] => {
          if (!childCategory.parentCategory) {
            return [];
          }

          const parentCategory = categories.find(
            (cat) => cat._id === childCategory.parentCategory
          );
          if (!parentCategory) {
            return [];
          }

          const parentSelected: SelectedCategory = {
            id: parentCategory._id || "",
            name: parentCategory.name,
          };

          // Đệ quy để lấy tất cả danh mục cha của cha
          return [parentSelected, ...getAllParentCategories(parentCategory)];
        };

        const parentCategoriesToAdd = getAllParentCategories(category);
        const categoriesToAdd = [
          { id: category._id || "", name: category.name },
          ...parentCategoriesToAdd,
        ];

        // Thêm tất cả danh mục mới (tránh trùng lặp)
        const newCategories = [...prev];
        categoriesToAdd.forEach((catToAdd) => {
          const exists = newCategories.some(
            (existing) =>
              existing.id === catToAdd.id || existing.name === catToAdd.name
          );
          if (!exists) {
            newCategories.push(catToAdd);
          }
        });

        return newCategories;
      } else {
        // Khi bỏ chọn danh mục cha, cũng bỏ chọn tất cả danh mục con
        const getAllChildCategories = (
          parentCategory: Category
        ): SelectedCategory[] => {
          const children = categories.filter(
            (cat) => cat.parentCategory === parentCategory._id
          );
          let allChildren: SelectedCategory[] = [];

          for (const child of children) {
            const childSelected: SelectedCategory = {
              id: child._id || "",
              name: child.name,
            };
            allChildren.push(childSelected);

            allChildren = [...allChildren, ...getAllChildCategories(child)];
          }

          return allChildren;
        };

        const childCategoriesToRemove = getAllChildCategories(category);
        const categoriesToRemove = [
          { id: category._id || "", name: category.name },
          ...childCategoriesToRemove,
        ];

        const newCategories = prev.filter(
          (existing) =>
            !categoriesToRemove.some(
              (toRemove) =>
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
      if (!name || !slug) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc");
      }

      // Validate stock
      if (!hasVariants && stock < 0) {
        throw new Error("Số lượng tồn kho không thể âm");
      }

      // Prepare category data
      const mainCategory = selectedCategories[0]?.name || "";
      const mainCategoryId = selectedCategories[0]?.id || "";
      const subCategories = selectedCategories.slice(1).map((c) => c.name);
      const subCategoryIds = selectedCategories.slice(1).map((c) => c.id);

      // Defensive: Validate publishedDate and publishedTime before creating Date
      let isoDate = "";
      if (publishedDate && publishedTime) {
        const dateObj = new Date(`${publishedDate}T${publishedTime}:00Z`);
        if (!isNaN(dateObj.getTime())) {
          isoDate = dateObj.toISOString();
        } else {
          // fallback to now
          isoDate = new Date().toISOString();
        }
      } else {
        isoDate = new Date().toISOString();
      }

      // Prepare product data
      const productData: Partial<Product> = {
        name,
        slug,
        sku: sku.trim() || undefined,
        description,
        shortDescription,
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
        updatedAt: isoDate,
        category: {
          main: mainCategory,
          sub: subCategories,
          subCategoryIds: subCategoryIds,
          tags: [],
          _id: mainCategoryId,
          name: mainCategory,
          slug: mainCategory.toLowerCase().replace(/\s+/g, "-"),
        },
        // Thêm filterAttributes vào dữ liệu sản phẩm
        filterAttributes: filters,
        variantAttributes,
        variants,
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
        specification,
        specificationDescription,
      };

      console.log("Submitting product with filters:", filters); // Debug log
      console.log("Submitting product with specification:", specification); // Debug log
      console.log("Submitting product with specificationDescription:", specificationDescription); // Debug log
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

      <div className="grid grid-cols-12 gap-4">
        {/* Left Column - Main Content (col-span-8) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Thông tin cơ bản */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h3 className="text-lg font-bold mb-4">Thông tin cơ bản</h3>
            <div className="space-y-4">
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
              <div>
                <label className="block mb-1 font-medium">Slug</label>
                {mode === "edit" ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://decorandmore.vn/san-pham/${slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      https://decorandmore.vn/san-pham/{slug}
                    </a>
                    <button
                      type="button"
                      className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                      onClick={() => setShowSlugEdit(true)}
                    >
                      Sửa
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="Nhập slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                )}
                {mode === "edit" && showSlugEdit && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Nhập slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                    <button
                      type="button"
                      className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => setShowSlugEdit(false)}
                    >
                      Lưu
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium">Mã SKU</label>
                <input
                  type="text"
                  placeholder="Nhập mã SKU"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Mô tả ngắn và Mô tả */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <div className="mb-6">
              <label className="block mb-2 font-medium">Mô tả ngắn</label>
              <SunEditerUploadImage
                postData={shortDescription}
                setPostData={setShortDescription}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Mô tả chi tiết</label>
              <SunEditerUploadImage
                postData={description}
                setPostData={setDescription}
              />
            </div>
          </div>

          {/* Stock and Variants Management */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                Quản lý tồn kho & biến thể
              </h3>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={hasVariants}
                  onChange={(e) => {
                    const newHasVariants = e.target.checked;
                    setHasVariants(newHasVariants);
                    // Không reset variantAttributes và variants khi tắt checkbox
                  }}
                  className="mr-2"
                />
                <span className="text-sm">Sản phẩm có biến thể</span>
              </label>
            </div>

            {!hasVariants ? (
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
            ) : (
              <VariantOptions
                initialAttributes={variantAttributes}
                initialVariants={variants}
                onAttributesChange={handleVariantAttributesChange}
                onVariantsChange={handleVariantsChange}
              />
            )}
          </div>
          {/* Thông số kỹ thuật */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Thông số kỹ thuật</h3>
              <div className="flex items-center gap-2">
                {isLoadingSpecifications && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Đang tải template...</span>
                  </div>
                )}
                {selectedCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={handleRefreshSpecificationTemplates}
                    disabled={isLoadingSpecifications}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    Làm mới template
                  </button>
                )}
              </div>
            </div>

            {/* Show auto-populated categories info */}
            {autoPopulatedCategories.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-800 font-medium">
                    Đã tự động tải template từ danh mục:
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {autoPopulatedCategories.map((categoryName, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                    >
                      {categoryName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block mb-1">
                  Chọn template thông số kỹ thuật
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  onChange={async (e) => {
                    const slug = e.target.value;
                    if (slug) {
                      const spec = await fetchSpecificationBySlug(slug);
                      if (spec) {
                        // Check if this is a specification template (isSpecification == true)
                        if (spec.isSpecification === true) {
                          // If it's a specification template, populate specificationDescription
                          setSpecificationDescription(
                            spec.isSpecificationProduct || ""
                          );
                          // Set the title from the template but clear groups since this is a description-only templatezz
                          setSpecification({
                            title: spec.title || "",
                            groups: [],
                          });
                        } else {
                          // If it's a regular template, populate specification groups
                          setSpecification({
                            title: spec.title || "",
                            groups: spec.groups.map((group: any) => ({
                              title: group.title,
                              specs: group.specs,
                            })),
                          });
                          // Clear specificationDescription since this is a groups template
                          setSpecificationDescription("");
                        }
                      }
                    } else {
                      // If no template selected, clear both
                      setSpecification({
                        title: specification.title || "",
                        groups: [],
                      });
                      setSpecificationDescription("");
                    }
                  }}
                >
                  <option value="">-- Chọn template --</option>
                  {specifications.map((spec) => (
                    <option key={spec._id} value={spec.slug}>
                      {spec.name}{" "}
                      {spec.isSpecification === true ? "(Mô tả)" : "(Nhóm)"}
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
                    setSpecification((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="Ví dụ: Thông số kỹ thuật"
                />
              </div>

              {specification.groups.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className="border rounded-lg p-4 space-y-4"
                >
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
                        newGroups[groupIndex].specs.push({
                          name: "",
                          value: "",
                        });
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

              {/* Mô tả thông số kỹ thuật */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-md font-semibold mb-3">
                  Mô tả thông số kỹ thuật
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả chi tiết thông số kỹ thuật
                  </label>
                  <SunEditerForSpecification
                    postData={specificationDescription}
                    setPostData={setSpecificationDescription}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Sử dụng để mô tả chi tiết thông số kỹ thuật của sản phẩm. Có
                    thể bao gồm hình ảnh, bảng biểu, và định dạng văn bản phong
                    phú.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar (col-span-4) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Publish Info */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h3 className="text-lg font-bold mb-4">Thông tin xuất bản</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Ngày đăng</label>
                <input
                  type="date"
                  value={publishedDate}
                  onChange={(e) => setPublishedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Thời gian đăng</label>
                <input
                  type="time"
                  value={publishedTime}
                  onChange={(e) => setPublishedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div className="pt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={(e) => setIsVisible(e.target.checked)}
                    className="form-checkbox"
                  />
                  <span>Ẩn sản phẩm</span>
                </label>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h3 className="text-lg font-bold mb-4">Giá sản phẩm</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Giá nhập</label>
                <input
                  type="number"
                  min={0}
                  value={importPrice}
                  onChange={(e) => setImportPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Giá bán</label>
                <input
                  type="number"
                  min={0}
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
                  min={0}
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h3 className="text-lg font-bold mb-4">Hình ảnh</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Ảnh đại diện</label>
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
                  <img
                    src={thumbnail}
                    alt="Thumbnail"
                    className="mt-2 w-32 h-32 object-cover"
                    width={128}
                    height={128}
                  />
                )}
              </div>
              <div>
                <label className="block mb-2">Thư viện ảnh</label>
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
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {gallery.map((url, index) => (
                    <div key={index} className="relative">
                      <img
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

          {/* Categories */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h3 className="text-lg font-bold mb-4">Danh mục sản phẩm</h3>
            <CategoryTree
              categories={categories}
              selectedCategoryNames={selectedCategories.map((c) => c.name)}
              handleCategoryChange={handleCategoryChange}
            />
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
