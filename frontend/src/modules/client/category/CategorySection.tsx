import CategoryPage from "./components/Category";

export default function CategoriesSection({slug} : {slug: string}) {
  return <CategoryPage slug={slug} />
}