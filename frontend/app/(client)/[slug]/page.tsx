
import React from "react";
import { PageContent } from "@/modules/client/create-page/components/PageContent";
import ClientLayout from "@/modules/client/common/layouts/ClientLayout";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return (
      <ClientLayout>
      <PageContent
        slug={slug}
        className="bg-white rounded-lg shadow-md p-6"
      />
      </ClientLayout>
  );
}