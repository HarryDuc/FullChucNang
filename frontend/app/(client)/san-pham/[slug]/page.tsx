import ProductDetail from "@/modules/client/pages/ProductDetail";
import ClientLayout from "@/modules/client/common/layouts/ClientLayout";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const {slug} = await params;
  return (
    <ClientLayout>
      <ProductDetail slug={slug} />
    </ClientLayout>
  );
}
