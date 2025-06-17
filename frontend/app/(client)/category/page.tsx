import CategoryProductLayout from "@/modules/client/common/layouts/CategoryProductLayout";

import ProductPage from "@/modules/client/pages/Products";

export default async function Product({params}: {params: {slug: string}}) {
  const {slug} = await params;
  return (
    <CategoryProductLayout>
      <ProductPage slug={slug} />
    </CategoryProductLayout>
  );
}
