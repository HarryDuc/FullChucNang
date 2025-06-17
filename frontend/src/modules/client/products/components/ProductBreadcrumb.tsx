import React from "react";
import Link from "next/link";
interface ProductBreadcrumbProps {
  product: {
    name: string;
    slug: string;
    category?: {
      main?: string;
    };
  };
}

const ProductBreadcrumb: React.FC<ProductBreadcrumbProps> = ({ product }) => (
  <nav aria-label="Breadcrumb" className="container mx-auto my-4 p-4 bg-[#f5f5fa] rounded-lg shadow-sm">
    <ol className="text-sm flex flex-wrap items-center" itemScope itemType="https://schema.org/BreadcrumbList">
      <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
        <Link href="/" className="text-gray-500 hover:text-blue-900 no-underline font-medium" itemProp="item">
          <span itemProp="name">Trang chủ</span>
        </Link>
        <meta itemProp="position" content="1" />
        <span className="mx-2 text-gray-400">/</span>
      </li>
      {product.category && product.category.main && (
        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <Link href={`/category`} className="text-gray-500 hover:text-blue-900 no-underline font-medium" itemProp="item">
            <span itemProp="name">{product.category.main}</span>
          </Link>
          <meta itemProp="position" content="2" />
          <span className="mx-2 text-gray-400">/</span>
        </li>
      )}
      <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="text-blue-900 font-bold">
        <span itemProp="name">{product.name}</span>
        <meta itemProp="position" content={product.category && product.category.main ? "3" : "2"} />
      </li>
    </ol>
  </nav>
);

export default ProductBreadcrumb;