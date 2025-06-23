
import { EditScript } from "@/modules/admin/script/pages/EditScript";

interface EditScriptPageProps {
  params: {
    id: string;
  };
}

export default async function EditScriptPage({ params }: EditScriptPageProps) {
  const { id } = await params;
  return <EditScript scriptId={id} />
}
