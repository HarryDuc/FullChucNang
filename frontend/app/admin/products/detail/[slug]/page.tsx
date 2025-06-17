"use client";
import React from "react";
import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";

export default async function CreateProductPage({ params }: { params: { slug: string } }) {
  const {slug} = params;

  return (
    <LayoutAdmin>
      <div className="container mx-auto p-4">
      </div>
    </LayoutAdmin>
  );
};


