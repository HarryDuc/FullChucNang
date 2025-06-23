
import { PageContent } from "@/modules/client/create-page/components/PageContent";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return (
      <PageContent
        slug={slug}
        className="bg-white rounded-lg shadow-md p-6"
      />
  );
}