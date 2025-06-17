import { FC, useState } from "react";
import {
  useScripts,
  useCreateScript,
  useUpdateScript,
  useDeleteScript,
  useToggleScriptActive,
} from "../../../client/common/hooks/useScript";
import {
  CreateScriptDto,
  ScriptPosition,
} from "../../../client/common/services/script.service";

export const ScriptManager: FC = () => {
  const { data: scripts, isLoading } = useScripts();
  const createScript = useCreateScript();
  const updateScript = useUpdateScript();
  const deleteScript = useDeleteScript();
  const toggleActive = useToggleScriptActive();

  const [newScript, setNewScript] = useState<CreateScriptDto>({
    name: "",
    content: "",
    position: ScriptPosition.HEADER,
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createScript.mutate(newScript);
    setNewScript({
      name: "",
      content: "",
      position: ScriptPosition.HEADER,
      description: "",
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this script?")) {
      deleteScript.mutate(id);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Script Manager</h2>

      {/* Form to add new script */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label className="block mb-2">Name:</label>
          <input
            type="text"
            value={newScript.name}
            onChange={(e) =>
              setNewScript({ ...newScript, name: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Content:</label>
          <textarea
            value={newScript.content}
            onChange={(e) =>
              setNewScript({ ...newScript, content: e.target.value })
            }
            className="w-full p-2 border rounded h-32"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Position:</label>
          <select
            value={newScript.position}
            onChange={(e) =>
              setNewScript({
                ...newScript,
                position: e.target.value as ScriptPosition,
              })
            }
            className="w-full p-2 border rounded"
          >
            {Object.values(ScriptPosition).map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2">Description:</label>
          <input
            type="text"
            value={newScript.description}
            onChange={(e) =>
              setNewScript({ ...newScript, description: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={createScript.isPending}
        >
          {createScript.isPending ? "Adding..." : "Add Script"}
        </button>
      </form>

      {/* List of existing scripts */}
      <div className="space-y-4">
        {scripts?.map((script) => (
          <div key={script._id} className="border p-4 rounded">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{script.name}</h3>
                <p className="text-sm text-gray-600">{script.description}</p>
                <p className="text-sm">Position: {script.position}</p>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-x-auto">
                  {script.content}
                </pre>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => toggleActive.mutate(script._id)}
                  className={`px-3 py-1 rounded ${
                    script.isActive ? "bg-green-500" : "bg-gray-500"
                  } text-white`}
                >
                  {script.isActive ? "Active" : "Inactive"}
                </button>
                <button
                  onClick={() => handleDelete(script._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
