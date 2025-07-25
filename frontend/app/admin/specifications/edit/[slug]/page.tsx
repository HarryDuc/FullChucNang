import { EditSpecificationPage } from '@/modules/admin/specification/components/EditSpecificationPage';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <EditSpecificationPage slug={slug} />;
}