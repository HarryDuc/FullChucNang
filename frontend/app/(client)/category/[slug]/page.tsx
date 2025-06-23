import { checkRedirect } from "@/common/components/CheckRedirect";
import ProductPage from "@/modules/client/pages/Products";
import { redirect } from "next/navigation";

export default async function CategoryPageWrapper({params,}: {params: { slug: string }}) {
  const {slug} = await params;
  const redirectData = await checkRedirect(`/danh-muc/${slug}`);
  if (redirectData) {
    return redirect(redirectData.newPath);
  }
  return (
    <ProductPage slug={slug} />
  );
}
