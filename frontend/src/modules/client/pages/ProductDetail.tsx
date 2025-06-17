import ProductDetailSection from "../products/ProductDetail";

interface ProductDetailProps {
  slug?: string;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ slug }) => {
  return <ProductDetailSection slug={slug} />;
};

export default ProductDetail;
