import ProductListSection from "./components/ProductList";

export default function ProductList({slug} : {slug: string}) {
  return <ProductListSection slug={slug} />
}