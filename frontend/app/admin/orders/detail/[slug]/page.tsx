
import DetailOrders from "@/modules/admin/orders/components/DetailOrders";

export default async function CategoriesProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  return (
    <div>
      <DetailOrders slug={slug} />
    </div>
  );
}
