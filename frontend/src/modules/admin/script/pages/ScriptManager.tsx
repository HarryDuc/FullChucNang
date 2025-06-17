"use client";

import { FC } from "react";
import { useRouter } from "next/navigation";
import { useScripts } from "@/modules/client/common/hooks/useScript";
import { ScriptList } from "../components/ScriptList";

export const ScriptManager: FC = () => {
  const router = useRouter();
  const { data: scripts, isLoading } = useScripts();

  const handleCreateNew = () => {
    router.push("/admin/scripts/create");
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Script Manager</h1>
          <p className="text-gray-600">Manage your website scripts</p>
        </div>

        <button
          onClick={handleCreateNew}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Script
        </button>
      </div>

      {scripts && scripts.length > 0 ? (
        <ScriptList scripts={scripts} />
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded">
          <p className="text-gray-600">No scripts found</p>
          <button
            onClick={handleCreateNew}
            className="mt-4 text-blue-500 hover:text-blue-600"
          >
            Create your first script
          </button>
        </div>
      )}
    </div>
  );
};
