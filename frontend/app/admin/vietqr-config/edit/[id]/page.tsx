import EditVietQRConfigPage from "@/modules/admin/vietqr-config/components/EditVietQRConfigPage";

interface Props {
  params: {
    id: string;
  };
}

export default async function EditVietQRConfigPageWrapper({ params }: Props) {
  const { id } = await params;

  return <EditVietQRConfigPage id={id} />;
}
