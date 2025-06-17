"use client";

import React, { useState } from "react";
import { UserList } from "@/modules/admin/permissions/components/UserList";
import { PermissionManager } from "@/modules/admin/permissions/components/PermissionManager";
import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";

export default function PermissionPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
    <LayoutAdmin>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">User Permissions Management</h1>

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
                Please select a user to manage their permissions
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutAdmin>
  );
}
