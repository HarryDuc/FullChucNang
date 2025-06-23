import ProductLayout from "@/modules/client/common/layouts/ProductLayout";

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProductLayout>{children}</ProductLayout>;
}