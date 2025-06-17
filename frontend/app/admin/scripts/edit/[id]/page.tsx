import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";
import { EditScript } from "@/modules/admin/script/pages/EditScript";

interface EditScriptPageProps {
  params: {
    id: string;
  };
}

export default async function EditScriptPage({ params }: EditScriptPageProps) {
  const { id } = await params;
  return (
    <LayoutAdmin>
      <EditScript scriptId={id} />
    </LayoutAdmin>
  );
}
