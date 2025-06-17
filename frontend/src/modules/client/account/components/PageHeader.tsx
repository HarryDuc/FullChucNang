"use client";

import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

const PageHeader = ({ title, description }: PageHeaderProps) => {
  return (
    <div className="border-b border-gray-200 pb-4 mb-6">
      <h1 className="text-xl font-medium mb-1 text-gray-900">{title}</h1>
      {description && <p className="text-gray-500 text-sm">{description}</p>}
    </div>
  );
};

export default PageHeader; 