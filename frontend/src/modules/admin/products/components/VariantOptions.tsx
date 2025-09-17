"use client";
import React, { useState, useEffect } from "react";
import {
  VariantAttribute,
  VariantAttributeValue,
  ProductVariant,
} from "../models/product.model";
import { useImages } from "../../../../common/hooks/useImages";

interface VariantOptionsProps {
  initialAttributes?: VariantAttribute[];
  initialVariants?: ProductVariant[];
  onAttributesChange: (attributes: VariantAttribute[]) => void;
  onVariantsChange: (variants: ProductVariant[]) => void;
}

export const VariantOptions: React.FC<VariantOptionsProps> = ({
  initialAttributes = [],
  initialVariants = [],
  onAttributesChange,
  onVariantsChange,
}) => {
  const [attributes, setAttributes] =
    useState<VariantAttribute[]>(initialAttributes);
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants);
  const { uploadImage, uploadMultipleImages, loading } = useImages();

  // Cập nhật variants khi attributes thay đổi
  useEffect(() => {
    generateVariants();
  }, [attributes]);

  // Thêm thuộc tính mới
  const addAttribute = () => {
    const newAttribute: VariantAttribute = {
      name: "",
      slug: "",
      values: [],
    };
    setAttributes([...attributes, newAttribute]);
  };

  // Xóa thuộc tính
  const removeAttribute = (index: number) => {
    const newAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(newAttributes);
    onAttributesChange(newAttributes);
  };

  // Cập nhật tên thuộc tính
  const updateAttributeName = (index: number, name: string) => {
    const newAttributes = [...attributes];
    newAttributes[index] = {
      ...newAttributes[index],
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
    };
    setAttributes(newAttributes);
    onAttributesChange(newAttributes);
  };

  // Thêm giá trị cho thuộc tính
  const addAttributeValue = (attributeIndex: number) => {
    const newAttributes = [...attributes];
    const newValue: VariantAttributeValue = {
      value: "",
      slug: "",
      additionalPrice: 0,
    };
    newAttributes[attributeIndex].values.push(newValue);
    setAttributes(newAttributes);
    onAttributesChange(newAttributes);
  };

  // Xóa giá trị thuộc tính
  const removeAttributeValue = (attributeIndex: number, valueIndex: number) => {
    const newAttributes = [...attributes];
    newAttributes[attributeIndex].values = newAttributes[
      attributeIndex
    ].values.filter((_, i) => i !== valueIndex);
    setAttributes(newAttributes);
    onAttributesChange(newAttributes);
  };

  // Cập nhật giá trị thuộc tính
  const updateAttributeValue = (
    attributeIndex: number,
    valueIndex: number,
    field: keyof VariantAttributeValue,
    value: string | number
  ) => {
    const newAttributes = [...attributes];
    const attributeValue = newAttributes[attributeIndex].values[valueIndex];

    if (field === "value") {
      attributeValue.value = value as string;
      attributeValue.slug = (value as string)
        .toLowerCase()
        .replace(/\s+/g, "-");
    } else if (field === "additionalPrice" || field === "discountPrice") {
      attributeValue[field] = value as number;
    }

    setAttributes(newAttributes);
    onAttributesChange(newAttributes);
  };

  // Cập nhật thông tin variant
  const updateVariant = (
    variantIndex: number,
    field: keyof ProductVariant,
    value: string | number | string[]
  ) => {
    const newVariants = [...variants];
    const variant = newVariants[variantIndex];

    if (field === "sku") {
      variant.sku = value as string;
    } else if (field === "variantStock") {
      variant.variantStock = value as number;
    } else if (field === "variantImportPrice") {
      variant.variantImportPrice = value as number;
    } else if (field === "variantCurrentPrice") {
      variant.variantCurrentPrice = value as number;
    } else if (field === "variantDiscountPrice") {
      variant.variantDiscountPrice = value as number;
    } else if (field === "variantThumbnail") {
      variant.variantThumbnail = value as string;
    } else if (field === "variantGalleries") {
      variant.variantGalleries = value as string[];
    }

    setVariants(newVariants);
    onVariantsChange(newVariants);
  };

  // Upload ảnh thumbnail cho variant
  const handleThumbnailUpload = async (variantIndex: number, file: File) => {
    const result = await uploadImage(file);
    if (result && result.imageUrl) {
      updateVariant(variantIndex, "variantThumbnail", result.imageUrl);
    }
  };

  // Upload ảnh gallery cho variant
  const handleGalleryUpload = async (variantIndex: number, files: FileList) => {
    const fileArray = Array.from(files);
    const results = await uploadMultipleImages(fileArray);
    if (results && results.length > 0) {
      const imageUrls = results.map(result => result.imageUrl).filter(Boolean);
      const currentGalleries = variants[variantIndex].variantGalleries || [];
      updateVariant(variantIndex, "variantGalleries", [...currentGalleries, ...imageUrls]);
    }
  };

  // Xóa ảnh gallery
  const removeGalleryImage = (variantIndex: number, imageIndex: number) => {
    const currentGalleries = variants[variantIndex].variantGalleries || [];
    const newGalleries = currentGalleries.filter((_, index) => index !== imageIndex);
    updateVariant(variantIndex, "variantGalleries", newGalleries);
  };

  // Tạo variants từ combinations
  const generateVariants = () => {
    if (attributes.length === 0) {
      setVariants([]);
      onVariantsChange([]);
      return;
    }

    // Lọc bỏ các thuộc tính không có giá trị
    const validAttributes = attributes.filter(
      (attr) =>
        attr.name && attr.values.length > 0 && attr.values.some((v) => v.value)
    );

    if (validAttributes.length === 0) {
      setVariants([]);
      onVariantsChange([]);
      return;
    }

    // Tạo các combination
    const combinations = validAttributes.reduce<
      Array<Array<{ attributeName: string; value: string }>>
    >((acc, attr) => {
      if (acc.length === 0) {
        return attr.values.map((v) => [
          {
            attributeName: attr.name,
            value: v.value,
          },
        ]);
      }

      const newCombinations: Array<
        Array<{ attributeName: string; value: string }>
      > = [];
      acc.forEach((combination) => {
        attr.values.forEach((v) => {
          newCombinations.push([
            ...combination,
            {
              attributeName: attr.name,
              value: v.value,
            },
          ]);
        });
      });
      return newCombinations;
    }, []);

    // Tạo variants từ combinations, giữ lại thông tin cũ nếu có
    const newVariants: ProductVariant[] = combinations.map((combination) => {
      const variantName = combination.map((c) => `${c.value}`).join(" - ");

      // Tìm variant cũ có cùng combination
      const existingVariant = variants.find(
        (v) =>
          v.combination.length === combination.length &&
          v.combination.every(
            (c, i) =>
              c.attributeName === combination[i].attributeName &&
              c.value === combination[i].value
          )
      );

      return {
        ...(existingVariant || {}),
        variantName,
        combination,
        sku: existingVariant?.sku || "",
        variantStock: existingVariant?.variantStock || 0,
        variantSold: existingVariant?.variantSold || 0,
        variantImportPrice: existingVariant?.variantImportPrice || 0,
        variantCurrentPrice: existingVariant?.variantCurrentPrice || 0,
        variantDiscountPrice: existingVariant?.variantDiscountPrice || 0,
        variantThumbnail: existingVariant?.variantThumbnail || "",
        variantGalleries: existingVariant?.variantGalleries || [],
      };
    });

    setVariants(newVariants);
    onVariantsChange(newVariants);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Biến thể sản phẩm</h3>
        <button
          type="button"
          onClick={addAttribute}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Thêm thuộc tính
        </button>
      </div>

      {/* Danh sách thuộc tính */}
      {attributes.map((attribute, attrIndex) => (
        <div key={attrIndex} className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-medium">Tên thuộc tính</label>
              <input
                type="text"
                value={attribute.name}
                onChange={(e) => updateAttributeName(attrIndex, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                placeholder="VD: Màu sắc, Kích thước..."
              />
            </div>
            <button
              type="button"
              onClick={() => removeAttribute(attrIndex)}
              className="px-3 py-2 text-red-600 hover:text-red-700"
            >
              Xóa
            </button>
          </div>

          {/* Danh sách giá trị */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-medium">Giá trị thuộc tính</label>
              <button
                type="button"
                onClick={() => addAttributeValue(attrIndex)}
                className="text-blue-600 hover:text-blue-700"
              >
                + Thêm giá trị
              </button>
            </div>

            {attribute.values.map((value, valueIndex) => (
              <div key={valueIndex} className="flex items-center gap-4">
                <input
                  type="text"
                  value={value.value}
                  onChange={(e) =>
                    updateAttributeValue(
                      attrIndex,
                      valueIndex,
                      "value",
                      e.target.value
                    )
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded"
                  placeholder="VD: Đỏ, XL..."
                />
                {/* <input
                  type="number"
                  value={value.additionalPrice || 0}
                  onChange={(e) =>
                    updateAttributeValue(
                      attrIndex,
                      valueIndex,
                      "additionalPrice",
                      Number(e.target.value)
                    )
                  }
                  className="w-32 px-3 py-2 border border-gray-300 rounded"
                  placeholder="Giá thêm"
                /> */}
                <button
                  type="button"
                  onClick={() => removeAttributeValue(attrIndex, valueIndex)}
                  className="px-3 py-2 text-red-600 hover:text-red-700"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Danh sách variants */}
      {variants.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold mb-4">Danh sách biến thể</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {variants.map((variant, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 space-y-4">
                <div className="border-b pb-4">
                  <h5 className="text-lg font-medium text-gray-900">{variant.variantName}</h5>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, "sku", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tồn</label>
                    <input
                      type="number"
                      value={variant.variantStock}
                      onChange={(e) => updateVariant(index, "variantStock", Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá nhập</label>
                    <input
                      type="number"
                      value={variant.variantImportPrice}
                      onChange={(e) => updateVariant(index, "variantImportPrice", Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán</label>
                    <input
                      type="number"
                      value={variant.variantCurrentPrice}
                      onChange={(e) => updateVariant(index, "variantCurrentPrice", Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá khuyến mãi</label>
                    <input
                      type="number"
                      value={variant.variantDiscountPrice}
                      onChange={(e) => updateVariant(index, "variantDiscountPrice", Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh thumbnail</label>
                    <div className="space-y-3">
                      {variant.variantThumbnail && (
                        <div className="relative inline-block">
                          <img
                            src={variant.variantThumbnail}
                            alt="Thumbnail"
                            className="w-24 h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => updateVariant(index, "variantThumbnail", "")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleThumbnailUpload(index, file);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading}
                      />
                      {loading && <div className="text-sm text-gray-500">Đang upload...</div>}
                    </div>
                  </div>

                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh gallery</label>
                    <div className="space-y-3">
                      {variant.variantGalleries && variant.variantGalleries.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {variant.variantGalleries.map((imageUrl, imageIndex) => (
                            <div key={imageIndex} className="relative">
                              <img
                                src={imageUrl}
                                alt={`Gallery ${imageIndex + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(index, imageIndex)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            handleGalleryUpload(index, files);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading}
                      />
                      {loading && <div className="text-sm text-gray-500">Đang upload...</div>}
                    </div>
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
