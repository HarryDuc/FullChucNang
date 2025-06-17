import React from "react";
import { PageForm } from "@/modules/admin/create-page/components/PageForm";
import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";
import { Toaster } from "react-hot-toast";

export default async function EditPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  return (
    <LayoutAdmin>
      <PageForm
        slug={slug}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8"
      />
    </LayoutAdmin>
  );
}
