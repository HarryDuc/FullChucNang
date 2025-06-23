import ClientLayout from "@/modules/client/common/layouts/ClientLayout";
import PostDetailClientPage from "@/modules/client/pages/PostDetailClient";

export default async function CategoryPageWrapper({ params, }: { params: { slug: string } }) {
  const { slug } = await params;

  return (
      <PostDetailClientPage slug={slug} />
  );

}
