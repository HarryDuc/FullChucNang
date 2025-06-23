
import { PageForm } from "@/modules/admin/create-page/components/PageForm";

export default async function EditPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  return (
      <PageForm
        slug={slug}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8"
      />
  );
}
