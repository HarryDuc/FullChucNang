'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSpecification } from '../hooks/useSpecification';
import { SpecificationForm } from './SpecificationForm';

export const CreateSpecificationPage = () => {
  const router = useRouter();
  const { loading, createSpecification } = useSpecification();

  const handleCreate = async (data: any) => {
    const result = await createSpecification(data);
    if (result) {
      router.push('/admin/specifications');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Specification</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <SpecificationForm
          onSubmit={handleCreate}
          loading={loading}
          mode="create"
        />
      </div>
    </div>
  );
}; 