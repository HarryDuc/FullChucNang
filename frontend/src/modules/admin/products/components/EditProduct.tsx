"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProducts } from "../hooks/useProducts";
import { Product } from "../models/product.model";
import { ProductForm } from "./ProductForm";
import { toast } from "react-hot-toast";

const EditProduct = ({ slug }: { slug: string }) => {
  const router = useRouter();
  const { productDetail, getProductBySlug, updateProduct } = useProducts();

  useEffect(() => {
    if (slug) {
      getProductBySlug(slug);
    }
  }, [slug, getProductBySlug]);

  const handleSubmit = async (productData: Partial<Product>) => {
    if (!productDetail) return;
    await updateProduct(slug, productData);
    toast.success("Cập nhật sản phẩm thành công");
  };

  const handleCancel = () => {
    router.push("/admin/products");
  };

  if (!productDetail) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-4">
      <h2 className="text-3xl font-bold mb-4">Chỉnh sửa sản phẩm</h2>
      <ProductForm
        mode="edit"
        initialData={productDetail}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default EditProduct;
