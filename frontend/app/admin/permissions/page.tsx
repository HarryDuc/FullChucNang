import React, { useState } from "react";
import { UserList } from "@/modules/admin/permissions/components/UserList";
import { PermissionManager } from "@/modules/admin/permissions/components/PermissionManager";

export default function PermissionPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Quản lý quyền hạn người dùng</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User List */}
          <div className="md:col-span-1">
            <UserList
              onSelectUser={(userId) => setSelectedUserId(userId)}
              selectedUserId={selectedUserId || undefined}
            />
          </div>

          {/* Permission Manager */}
          <div className="md:col-span-2">
            {selectedUserId ? (
              <PermissionManager userId={selectedUserId} />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                Vui lòng chọn người dùng để quản lý quyền hạn
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
