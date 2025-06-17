"use client";

import { FC } from "react";
import { useRouter } from "next/navigation";
import { IScript } from "@/modules/client/common/services/script.service";
import {
  useDeleteScript,
  useToggleScriptActive,
} from "@/modules/client/common/hooks/useScript";

interface ScriptListProps {
  scripts: IScript[];
}

export const ScriptList: FC<ScriptListProps> = ({ scripts }) => {
  const router = useRouter();
  const deleteScript = useDeleteScript();
  const toggleActive = useToggleScriptActive();

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this script?")) {
      deleteScript.mutate(id);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/scripts/edit/${id}`);
  };

  return (
    <div className="space-y-4">
      {scripts.map((script) => (
        <div
          key={script._id}
          className="border p-4 rounded shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{script.name}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    script.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {script.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{script.description}</p>
              <p className="text-sm text-gray-500 mt-1">
                Position: {script.position}
              </p>
              <div className="mt-2">
                <label className="text-sm font-medium">Script Content:</label>
                <pre className="mt-1 p-2 bg-gray-50 rounded text-sm overflow-x-auto border">
                  {script.content}
                </pre>
              </div>
            </div>

            <div className="flex flex-col gap-2 ml-4">
              <button
                onClick={() => toggleActive.mutate(script._id)}
                className={`px-3 py-1 rounded text-white text-sm ${
                  script.isActive
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {script.isActive ? "Deactivate" : "Activate"}
              </button>

              <button
                onClick={() => handleEdit(script._id)}
                className="px-3 py-1 rounded bg-blue-500 text-white text-sm hover:bg-blue-600"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(script._id)}
                className="px-3 py-1 rounded bg-red-500 text-white text-sm hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
