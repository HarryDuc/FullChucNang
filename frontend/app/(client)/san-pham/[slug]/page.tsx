import ProductDetail from "@/modules/client/pages/ProductDetail";
import { checkRedirect } from "@/common/components/CheckRedirect";
import { redirect } from 'next/navigation';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const {slug} = await params;
  const redirectData = await checkRedirect(`/san-pham/${slug}`);
  if (redirectData) {
    redirect(redirectData.newPath);
  }
  return (
      <ProductDetail slug={slug} />
  );
}
