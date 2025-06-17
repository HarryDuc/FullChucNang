import ProductListSection from "../products/ProductListSection";

export default function ProductPage({slug}: {slug: string}) {
  return <ProductListSection slug={slug} />;
}
