"use client";

import { FC, useState } from "react";
import {
  CreateScriptDto,
  ScriptPosition,
  IScript,
} from "@/modules/client/common/services/script.service";

interface ScriptFormProps {
  initialValues?: IScript;
  onSubmit: (data: CreateScriptDto) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export const ScriptForm: FC<ScriptFormProps> = ({
  initialValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Save Script",
}) => {
  const [formData, setFormData] = useState<CreateScriptDto>({
    name: initialValues?.name || "",
    content: initialValues?.content || "",
    position: initialValues?.position || ScriptPosition.HEADER,
    description: initialValues?.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-2 text-sm font-medium">Name:</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium">Content:</label>
        <textarea
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          className="w-full p-2 border rounded h-32 focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium">Position:</label>
        <select
          value={formData.position}
          onChange={(e) =>
            setFormData({
              ...formData,
              position: e.target.value as ScriptPosition,
            })
          }
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        >
          {Object.values(ScriptPosition).map((position) => (
            <option key={position} value={position}>
              {position.charAt(0).toUpperCase() + position.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium">Description:</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isLoading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
};
