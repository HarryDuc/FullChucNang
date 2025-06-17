import React from "react";
import EditProduct from "@/modules/admin/products/components/EditProduct";
import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";

export default async function CreateProductPage({ params }: { params: { slug: string } }) {
  const {slug} = await params;

  return (
    <LayoutAdmin>
      <div>
        {/* Truyền slug vào component EditProduct */}
        {slug ? <EditProduct slug={slug} /> : <p>Loading...</p>}
      </div>
    </LayoutAdmin>
  );
};

