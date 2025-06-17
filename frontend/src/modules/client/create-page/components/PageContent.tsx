"use client";

import React from "react";
import { usePage } from "../hooks/usePage";
import 'suneditor/dist/css/suneditor.min.css';
import '@/styles/suneditor-content.css';
import NotFound from "../../common/components/not-found";

interface PageContentProps {
  slug: string;
  className?: string;
}

export const PageContent: React.FC<PageContentProps> = ({
  slug,
  className = "",
}) => {
  const { page, loading, error } = usePage(slug);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
        <NotFound />
    );
  }

  if (!page) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
        <p>Page not found.</p>
      </div>
    );
  }

  return (
    <article className={`max-w-none prose lg:prose-xl ${className}`}>
    <div
      dangerouslySetInnerHTML={{ __html: page.content }}
    />
    </article>
  );
};
