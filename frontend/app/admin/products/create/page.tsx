import React from "react";
import CreateProduct from "@/modules/admin/products/components/CreateProduct";
import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";

const CreateProductPage = () => {
  return (
    <LayoutAdmin>
      <div>
        <CreateProduct />
      </div>
    </LayoutAdmin>
  );
};

export default CreateProductPage;
