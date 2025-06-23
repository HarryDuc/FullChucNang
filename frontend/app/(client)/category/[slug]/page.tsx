import { checkRedirect } from "@/common/components/CheckRedirect";
import ProductLayout from "@/modules/client/common/layouts/ProductLayout";
import ProductPage from "@/modules/client/pages/Products";

export default async function CategoryPageWrapper({params,}: {params: { slug: string }}) {
  const {slug} = await params;
  const redirect = await checkRedirect(`/danh-muc/${slug}`);
  if (redirect) {
    return redirect(redirect.newPath);
  }
  return (
    <ProductPage slug={slug} />
  );
}
