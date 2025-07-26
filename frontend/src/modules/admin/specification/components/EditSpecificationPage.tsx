'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSpecification } from '../hooks/useSpecification';
import { SpecificationForm } from './SpecificationForm';

interface EditSpecificationPageProps {
  slug: string;
}

export const EditSpecificationPage = ({ slug }: EditSpecificationPageProps) => {
  const router = useRouter();
  const { loading, selectedSpec, fetchSpecificationBySlug, updateSpecification } = useSpecification();

  useEffect(() => {
    fetchSpecificationBySlug(slug);
  }, [fetchSpecificationBySlug, slug]);

  const handleUpdate = async (data: any) => {
    if (selectedSpec) {
      const result = await updateSpecification(selectedSpec.slug, data);
      if (result) {
        router.push('/admin/specifications');
      }
    }
  };

  if (!selectedSpec) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Sửa thông số kỹ thuật</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <SpecificationForm
          initialData={selectedSpec}
          onSubmit={handleUpdate}
          loading={loading}
          mode="edit"
        />
      </div>
    </div>
  );
}; 