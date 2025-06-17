"use client";

import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";
import { VietQRConfigPage } from "@/modules/admin/vietqr-config/components/VietQRConfigPage";

export default function Page() {
  return (
    <LayoutAdmin>
      <VietQRConfigPage />
    </LayoutAdmin>
  );
}
