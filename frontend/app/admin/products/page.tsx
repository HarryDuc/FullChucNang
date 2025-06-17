"use client";

import React from "react";
import ListProducts from "@/modules/admin/products/components/ListProducts";
import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";

const CreateProductPage = () => {
  return (

    <LayoutAdmin>
      <div>
        <ListProducts />
      </div>
    </LayoutAdmin>
  )
};

export default CreateProductPage;
