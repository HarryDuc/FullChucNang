import ProductLayout from "@/modules/client/common/layouts/ProductLayout";
import ProductPage from "@/modules/client/pages/Products";

export default async function CategoryPageWrapper({params,}: {params: { slug: string }}) {
  const {slug} = await params;
  return (
    <ProductLayout>
      <ProductPage slug={slug} />
    </ProductLayout>
  );
}
