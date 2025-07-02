"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useProducts } from "../hooks/useProducts";
import { Product } from "../models/product.model";
import { ProductForm } from "./ProductForm";
import { toast } from "react-hot-toast";

const CreateProduct = () => {
  const router = useRouter();
  const { createProduct } = useProducts();

  const handleSubmit = async (productData: Partial<Product>) => {
    await createProduct(productData);
    router.push("/admin/products/edit/" + productData.slug);
    toast.success("Tạo sản phẩm thành công");
  };

  const handleCancel = () => {
    router.push("/admin/products");
  };

  return (
    <div className="container mx-auto py-4">
      <h2 className="text-3xl font-bold mb-4">Thêm sản phẩm</h2>
      <ProductForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreateProduct;
