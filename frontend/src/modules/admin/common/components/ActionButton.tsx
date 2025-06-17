"use client";

import React, { ReactNode } from "react";
import { PermissionGuard } from "@/modules/admin/permissions/components/PermissionGuard";

interface ActionButtonProps {
  resource: string;
  action: "create" | "update" | "delete" | "read" | string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  children: ReactNode;
}

/**
 * ActionButton component that conditionally renders based on user permissions
 *
 * @example
 * <ActionButton
 *   resource="products"
 *   action="create"
 *   onClick={handleCreate}
 *   className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
 * >
 *   Create Product
 * </ActionButton>
 */
const ActionButton: React.FC<ActionButtonProps> = ({
  resource,
  action,
  onClick,
  className = "",
  disabled = false,
  children,
}) => {
  return (
    <PermissionGuard resource={resource} action={action} fallback={null}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={className}
        type="button"
      >
        {children}
      </button>
    </PermissionGuard>
  );
};

export default ActionButton;
