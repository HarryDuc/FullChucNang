import DetailCategoriesProduct from "@/modules/admin/categories-product/pages/DetailCategoriesProduct";

export default async function DetailCategoriesProductPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
      <DetailCategoriesProduct slug={params.slug} />
  );
}
