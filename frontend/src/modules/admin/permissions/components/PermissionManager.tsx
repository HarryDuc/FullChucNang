// import React, { useState, useEffect, useMemo } from "react";
// import { usePermissions } from "../hooks/usePermissions";
// import { toast } from "react-hot-toast";
// import { useAuth } from "@/context/AuthContext";
// import { PermissionService } from "../services/permission.service";

// interface PermissionManagerProps {
//   userId: string;
// }

// export const PermissionManager: React.FC<PermissionManagerProps> = ({
//   userId,
// }) => {
//   const {
//     loading,
//     error,
//     permissions,
//     groupedPermissions,
//     userPermissions,
//     updateUserPermissions,
//     fetchUserPermissions,
//   } = usePermissions(userId);

//   const { user } = useAuth();
//   const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
//   const [isSaving, setIsSaving] = useState(false);
//   const [isAssigningAll, setIsAssigningAll] = useState(false);

//   // Memoize the grouped permissions to prevent unnecessary recalculations
//   const grouped = useMemo(() => {
//     if (!permissions.length) return {};
//     return groupedPermissions();
//   }, [permissions, groupedPermissions]);

//   // Update selected permissions when userPermissions changes
//   useEffect(() => {
//     if (userPermissions.length > 0) {
//       const permissionIds = userPermissions.map((up) => up.permissionId.id);
//       // Remove any duplicates
//       setSelectedPermissions([...new Set(permissionIds)]);
//     } else {
//       setSelectedPermissions([]);
//     }
//   }, [userPermissions]);

//   const handlePermissionChange =
//     (permissionId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
//       if (e.target.checked) {
//         setSelectedPermissions((prev) => [...new Set([...prev, permissionId])]);
//       } else {
//         setSelectedPermissions((prev) =>
//           prev.filter((id) => id !== permissionId)
//         );
//       }
//     };

//   // New function to handle "check all" for a resource
//   const handleResourceCheckAll =
//     (resource: string, permissions: any[]) =>
//     (e: React.ChangeEvent<HTMLInputElement>) => {
//       const permissionIds = permissions.map((p) => p.id);
//       if (e.target.checked) {
//         // Add all permissions for this resource
//         setSelectedPermissions((prev) => [
//           ...new Set([...prev, ...permissionIds]),
//         ]);
//       } else {
//         // Remove all permissions for this resource
//         setSelectedPermissions((prev) =>
//           prev.filter((id) => !permissionIds.includes(id))
//         );
//       }
//     };

//   // Function to check if all permissions for a resource are selected
//   const isResourceFullySelected = (permissions: any[]): boolean => {
//     return permissions.every((p) => selectedPermissions.includes(p.id));
//   };

//   // Function to check if some permissions for a resource are selected
//   const isResourcePartiallySelected = (permissions: any[]): boolean => {
//     return (
//       permissions.some((p) => selectedPermissions.includes(p.id)) &&
//       !permissions.every((p) => selectedPermissions.includes(p.id))
//     );
//   };

//   const handleSave = async () => {
//     if (!userId) {
//       toast.error("Please select a user first");
//       return;
//     }
//     try {
//       setIsSaving(true);
//       const success = await updateUserPermissions(userId, [
//         ...new Set(selectedPermissions),
//       ]);
//       if (success) {
//         toast.success("Permissions updated successfully");
//       }
//     } catch (err) {
//       toast.error("Failed to update permissions");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleAssignAllPermissions = async () => {
//     if (!userId) {
//       toast.error("Please select a user first");
//       return;
//     }
//     try {
//       setIsAssigningAll(true);
//       const permissionService = PermissionService.getInstance();
//       await permissionService.assignAllPermissionsToUser(userId);

//       // Refresh the user permissions after assigning all
//       await fetchUserPermissions(userId);

//       toast.success("All permissions assigned successfully");
//     } catch (err) {
//       console.error("Error assigning all permissions:", err);
//       toast.error("Failed to assign all permissions");
//     } finally {
//       setIsAssigningAll(false);
//     }
//   };

//   const isAdmin = user?.role === "admin";

//   if (loading) {
//     return (
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <div className="flex justify-center items-center h-32">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div
//         className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
//         role="alert"
//       >
//         <span className="block sm:inline">{error}</span>
//       </div>
//     );
//   }

//   if (!userId) {
//     return (
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <div className="text-center text-gray-500">
//           Please select a user to manage permissions
//         </div>
//       </div>
//     );
//   }

//   if (!permissions.length) {
//     return (
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <div className="text-center text-gray-500">
//           No permissions available
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-xl font-semibold">Manage User Permissions</h2>
//         <div className="flex space-x-2">
//           {isAdmin && (
//             <button
//               onClick={handleAssignAllPermissions}
//               disabled={isAssigningAll || loading}
//               className={`${
//                 isAssigningAll || loading
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-purple-500 hover:bg-purple-600"
//               } text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors`}
//             >
//               {isAssigningAll ? "Assigning..." : "Assign All"}
//             </button>
//           )}
//           <button
//             onClick={handleSave}
//             disabled={isSaving || loading}
//             className={`${
//               isSaving || loading
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-blue-500 hover:bg-blue-600"
//             } text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors`}
//           >
//             {isSaving ? "Saving..." : "Save Changes"}
//           </button>
//         </div>
//       </div>

//       <div className="space-y-6">
//         {Object.entries(grouped).map(([resource, permissions]) => (
//           <div key={resource} className="border rounded-lg p-4">
//             <div className="flex items-center justify-between mb-4 border-b pb-2">
//               <h3 className="text-lg font-semibold text-gray-800">
//                 {resource
//                   .split("-")
//                   .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//                   .join(" ")}
//               </h3>
//               <label className="flex items-center space-x-2">
//                 <input
//                   type="checkbox"
//                   checked={isResourceFullySelected(permissions)}
//                   ref={(el) => {
//                     if (el) {
//                       el.indeterminate =
//                         isResourcePartiallySelected(permissions);
//                     }
//                   }}
//                   onChange={handleResourceCheckAll(resource, permissions)}
//                   disabled={loading || isSaving}
//                   className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
//                 />
//                 <span className="text-sm font-medium text-gray-700">
//                   Select All
//                 </span>
//               </label>
//             </div>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//               {permissions.map((permission) => (
//                 <label
//                   key={permission.id}
//                   className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 transition-colors"
//                 >
//                   <input
//                     type="checkbox"
//                     checked={selectedPermissions.includes(permission.id)}
//                     onChange={handlePermissionChange(permission.id)}
//                     disabled={loading || isSaving}
//                     className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
//                   />
//                   <span className="text-sm text-gray-700 capitalize">
//                     {permission.action}
//                   </span>
//                 </label>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };
import React, { useState, useEffect, useMemo } from "react";
import { usePermissions } from "../hooks/usePermissions";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { PermissionService, Permission } from "../services/permission.service";

interface PermissionManagerProps {
  userId: string;
}

export const PermissionManager: React.FC<PermissionManagerProps> = ({
  userId,
}) => {
  const {
    loading,
    error,
    permissions,
    groupedPermissions,
    userPermissions,
    updateUserPermissions,
    fetchUserPermissions,
  } = usePermissions(userId);

  const { user } = useAuth();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAssigningAll, setIsAssigningAll] = useState(false);

  // Memoize the grouped permissions to prevent unnecessary recalculations
  const grouped = useMemo(() => {
    if (!permissions.length) return {};
    // Create a map to deduplicate permissions
    const permissionMap = new Map<string, Permission[]>();
    const groupedPerms = groupedPermissions();

    // Deduplicate permissions within each resource group
    Object.entries(groupedPerms).forEach(([resource, perms]) => {
      const uniquePerms = (perms as Permission[]).reduce((acc, curr) => {
        const key = `${curr.resource}-${curr.action}`;
        if (!acc.has(key)) {
          acc.set(key, curr);
        }
        return acc;
      }, new Map<string, Permission>());
      permissionMap.set(resource, Array.from(uniquePerms.values()));
    });

    return Object.fromEntries(permissionMap);
  }, [permissions, groupedPermissions]);

  // Update selected permissions when userPermissions changes
  useEffect(() => {
    if (userPermissions.length > 0) {
      const permissionIds = userPermissions.map((up) => up.permissionId.id);
      // Remove any duplicates
      setSelectedPermissions([...new Set(permissionIds)]);
    } else {
      setSelectedPermissions([]);
    }
  }, [userPermissions]);

  const handlePermissionChange =
    (permissionId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        setSelectedPermissions((prev) => [...new Set([...prev, permissionId])]);
      } else {
        setSelectedPermissions((prev) =>
          prev.filter((id) => id !== permissionId)
        );
      }
    };

  const handleResourceCheckAll =
    (resource: string, permissions: Permission[]) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const permissionIds = permissions.map((p) => p.id);
      if (e.target.checked) {
        setSelectedPermissions((prev) => [
          ...new Set([...prev, ...permissionIds]),
        ]);
      } else {
        setSelectedPermissions((prev) =>
          prev.filter((id) => !permissionIds.includes(id))
        );
      }
    };

  const isResourceFullySelected = (permissions: Permission[]): boolean => {
    return permissions.every((p) => selectedPermissions.includes(p.id));
  };

  const isResourcePartiallySelected = (permissions: Permission[]): boolean => {
    return (
      permissions.some((p) => selectedPermissions.includes(p.id)) &&
      !permissions.every((p) => selectedPermissions.includes(p.id))
    );
  };

  const formatResourceName = (resource: string): string => {
    return resource
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleSave = async () => {
    if (!userId) {
      toast.error("Please select a user first");
      return;
    }
    try {
      setIsSaving(true);
      const success = await updateUserPermissions(userId, [
        ...new Set(selectedPermissions),
      ]);
      if (success) {
        toast.success("Permissions updated successfully");
      }
    } catch (err) {
      toast.error("Failed to update permissions");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignAllPermissions = async () => {
    if (!userId) {
      toast.error("Please select a user first");
      return;
    }
    try {
      setIsAssigningAll(true);
      const permissionService = PermissionService.getInstance();
      await permissionService.assignAllPermissionsToUser(userId);
      await fetchUserPermissions(userId);
      toast.success("All permissions assigned successfully");
    } catch (err) {
      console.error("Error assigning all permissions:", err);
      toast.error("Failed to assign all permissions");
    } finally {
      setIsAssigningAll(false);
    }
  };

  const isAdmin = user?.role === "admin";

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          Please select a user to manage permissions
        </div>
      </div>
    );
  }

  if (!permissions.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          No permissions available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Manage User Permissions</h2>
        <div className="flex space-x-2">
          {isAdmin && (
            <button
              onClick={handleAssignAllPermissions}
              disabled={isAssigningAll || loading}
              className={`${
                isAssigningAll || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-500 hover:bg-purple-600"
              } text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors`}
            >
              {isAssigningAll ? "Assigning..." : "Assign All"}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || loading}
            className={`${
              isSaving || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors`}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([resource, permissions]) => (
          <div key={resource} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h3 className="text-lg font-semibold text-gray-800">
                {formatResourceName(resource)}
              </h3>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isResourceFullySelected(permissions as Permission[])}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = isResourcePartiallySelected(
                        permissions as Permission[]
                      );
                    }
                  }}
                  onChange={handleResourceCheckAll(
                    resource,
                    permissions as Permission[]
                  )}
                  disabled={loading || isSaving}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All
                </span>
              </label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(permissions as Permission[]).map((permission) => (
                <label
                  key={permission.id}
                  className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission.id)}
                    onChange={handlePermissionChange(permission.id)}
                    disabled={loading || isSaving}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {permission.action}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
