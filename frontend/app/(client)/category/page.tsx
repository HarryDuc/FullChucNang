import ProductPage from "@/modules/client/pages/Products";

export default async function Product({params}: {params: {slug: string}}) {
  const {slug} = await params;
  return (
    <ProductPage slug={slug} />
  );
}
