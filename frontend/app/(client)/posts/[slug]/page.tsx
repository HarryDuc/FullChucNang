import { checkRedirect } from "@/common/components/CheckRedirect";
import PostDetailClientPage from "@/modules/client/pages/PostDetailClient";
import { redirect } from "next/navigation";

export default async function CategoryPageWrapper({ params, }: { params: { slug: string } }) {
  const { slug } = await params;
  const redirectData = await checkRedirect(`/bai-viet/${slug}`);
  if (redirectData) {
    return redirect(redirectData.newPath);
  }

  return (
      <PostDetailClientPage slug={slug} />
  );

}
