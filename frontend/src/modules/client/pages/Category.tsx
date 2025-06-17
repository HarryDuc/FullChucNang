import CategoriesSection from "../category/CategorySection";

const CategoryPage = ({ slug } : {slug: string}) => {
  return <CategoriesSection slug={slug} />
};

export default CategoryPage;
