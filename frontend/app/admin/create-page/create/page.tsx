"use client";

import React from "react";
import { PageForm } from "@/modules/admin/create-page/components/PageForm";
import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";
import { Toaster } from "react-hot-toast";

export default function CreatePage() {
  return (
    <LayoutAdmin>
      <Toaster position="top-right" />
      <PageForm className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8" />
    </LayoutAdmin>
  );
}
