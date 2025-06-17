import DetailCategoriesProduct from "@/modules/admin/categories-product/pages/DetailCategoriesProduct";
import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";

export default async function DetailCategoriesProductPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <LayoutAdmin>
      <DetailCategoriesProduct slug={params.slug} />
    </LayoutAdmin>
  );
}
