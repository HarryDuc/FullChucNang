"use client";

import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";
import { ScriptManager } from "@/modules/admin/script/pages/ScriptManager";

export default function ScriptsPage() {
  return (
    <LayoutAdmin>
      <ScriptManager />
    </LayoutAdmin>
  );
}
