"use client";

import React from "react";
import { PageList } from "@/modules/admin/create-page/components/PageList";
import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";
import { Toaster } from "react-hot-toast";

export default function CreatePagePage() {
  return (
    <LayoutAdmin>
      <Toaster position="top-right" />
      <PageList className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8" />
    </LayoutAdmin>
  );
}
