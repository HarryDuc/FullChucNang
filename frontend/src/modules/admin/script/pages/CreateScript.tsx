"use client";

import { FC } from "react";
import { useRouter } from "next/navigation";
import { useCreateScript } from "@/modules/client/common/hooks/useScript";
import { ScriptForm } from "../components/ScriptForm";
import { CreateScriptDto } from "@/modules/client/common/services/script.service";

export const CreateScript: FC = () => {
  const router = useRouter();
  const createScript = useCreateScript();

  const handleCreate = async (data: CreateScriptDto) => {
    try {
      await createScript.mutateAsync(data);
      router.push("/admin/scripts");
    } catch (error) {
      console.error("Failed to create script:", error);
      // You might want to add toast notification here
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Script</h1>
        <p className="text-gray-600">Add a new script to your website</p>
      </div>

      <ScriptForm
        onSubmit={handleCreate}
        isLoading={createScript.isPending}
        submitLabel="Create Script"
      />
    </div>
  );
};
