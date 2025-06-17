"use client";

import { FC } from "react";
import { useRouter } from "next/navigation";
import {
  useScript,
  useUpdateScript,
} from "@/modules/client/common/hooks/useScript";
import { ScriptForm } from "../components/ScriptForm";
import { CreateScriptDto } from "@/modules/client/common/services/script.service";

interface EditScriptProps {
  scriptId: string;
}

export const EditScript: FC<EditScriptProps> = ({ scriptId }) => {
  const router = useRouter();
  const { data: script, isLoading: isLoadingScript } = useScript(scriptId);
  const updateScript = useUpdateScript();

  const handleUpdate = async (data: CreateScriptDto) => {
    try {
      await updateScript.mutateAsync({ id: scriptId, data });
      router.push("/admin/scripts");
    } catch (error) {
      console.error("Failed to update script:", error);
      // You might want to add toast notification here
    }
  };

  if (isLoadingScript) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (!script) {
    return <div className="text-center p-4">Script not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Script</h1>
        <p className="text-gray-600">Modify existing script</p>
      </div>

      <ScriptForm
        initialValues={script}
        onSubmit={handleUpdate}
        isLoading={updateScript.isPending}
        submitLabel="Update Script"
      />
    </div>
  );
};
