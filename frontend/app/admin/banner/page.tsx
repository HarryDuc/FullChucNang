"use client";

import React from "react";
import { BannerList } from "@/modules/admin/banner/components/BannerList";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";

const queryClient = new QueryClient();

export default function BannersPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <LayoutAdmin>
        <BannerList />
        </LayoutAdmin>
    </QueryClientProvider>
  );
}
