"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { VietQRConfigForm } from "@/modules/admin/vietqr-config/components/VietQRConfigForm";
import { useVietQRConfigs } from "@/modules/admin/vietqr-config/hooks/useVietQRConfigs";
import { VietQRConfig } from "@/modules/admin/vietqr-config/models/vietqr-config";
import { vietQRConfigService } from "@/modules/admin/vietqr-config/services/vietqr-config.service"

interface Props {
  params: {
    id: string;
  };
}

export default async function EditVietQRConfigPage({ params }: Props) {
  const { id } = await params;
  const router = useRouter();
  const { updateConfig } = useVietQRConfigs();
  const [config, setConfig] = useState<VietQRConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configs = await vietQRConfigService.getAll();
        const currentConfig = configs.find((c) => c._id === id);
        if (currentConfig) {
          setConfig(currentConfig);
        } else {
          router.push("/admin/vietqr-config");
        }
      } catch (error) {
        console.error("Error fetching config:", error);
        router.push("/admin/vietqr-config");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [id, router]);

  const handleSubmit = async (values: Partial<VietQRConfig>) => {
    try {
      if (config) {
        await updateConfig(config._id, values);
        router.push("/admin/vietqr-config");
      }
    } catch (error) {
      console.error("Error updating config:", error);
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  if (!config) {
    return (
        <div className="text-center py-8">
          <h2 className="text-xl text-gray-600">Không tìm thấy cấu hình</h2>
        </div>
    );
  }

  return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Chỉnh sửa cấu hình VietQR
        </h1>
        <VietQRConfigForm
          initialValues={config}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/vietqr-config")}
        />
      </div>
  );
}
