import ProductDetailSection from "../products/ProductDetail";

interface ProductDetailProps {
  slug: string;
}

const ProductDetail = ({ slug }: ProductDetailProps) => {
  return <ProductDetailSection slug={slug} />;
};

export default ProductDetail;
