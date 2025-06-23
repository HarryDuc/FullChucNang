import { checkRedirect } from "@/common/components/CheckRedirect";
import PostDetailClientPage from "@/modules/client/pages/PostDetailClient";

export default async function CategoryPageWrapper({ params, }: { params: { slug: string } }) {
  const { slug } = await params;
  const redirect = await checkRedirect(`/bai-viet/${slug}`);
  if (redirect) {
    return redirect(redirect.newPath);
  }

  return (
      <PostDetailClientPage slug={slug} />
  );

}
