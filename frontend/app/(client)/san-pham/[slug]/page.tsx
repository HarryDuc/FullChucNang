import ProductDetail from "@/modules/client/pages/ProductDetail";
import { checkRedirect } from "@/common/components/CheckRedirect";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const {slug} = await params;
  const redirect = await checkRedirect(`/san-pham/${slug}`);
  if (redirect) {
    return redirect(redirect.newPath);
  }
  return (
      <ProductDetail slug={slug} />
  );
}
