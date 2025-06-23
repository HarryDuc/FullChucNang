"use client";

import { useRouter } from "next/navigation";
import { VietQRConfigForm } from "@/modules/admin/vietqr-config/components/VietQRConfigForm";
import { useVietQRConfigs } from "@/modules/admin/vietqr-config/hooks/useVietQRConfigs";
import { CreateVietQRConfigDto } from "@/modules/admin/vietqr-config/models/vietqr-config";

export default function CreateVietQRConfigPage() {
  const router = useRouter();
  const { createConfig } = useVietQRConfigs();

  return (
      <VietQRConfigForm
        onSubmit={async (values) => {
          const createDto: CreateVietQRConfigDto = {
            bankName: values.bankName || "",
            bankBin: values.bankBin || "",
            accountNumber: values.accountNumber || "",
            accountName: values.accountName || "",
            template: values.template || "",
            active: values.active,
          };
          await createConfig(createDto);
          router.push("/admin/vietqr-config");
        }}
        onCancel={() => router.push("/admin/vietqr-config")}
      />
  );
}
