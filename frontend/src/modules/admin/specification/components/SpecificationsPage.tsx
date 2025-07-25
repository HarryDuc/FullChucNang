'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSpecification } from '../hooks/useSpecification';
import { SpecificationList } from './SpecificationList';
import { ISpecification } from '../models/specification.model';

export const SpecificationsPage = () => {
  const router = useRouter();
  const {
    specifications,
    fetchSpecifications,
    deleteSpecification,
    updateSpecificationStatus,
  } = useSpecification();

  useEffect(() => {
    fetchSpecifications();
  }, [fetchSpecifications]);

  const handleEdit = (spec: ISpecification) => {
    router.push(`/admin/specifications/edit/${spec.slug}`);
  };

  const handleDelete = async (slug: string) => {
    if (window.confirm('Are you sure you want to delete this specification?')) {
      await deleteSpecification(slug);
    }
  };

  const handleStatusChange = async (slug: string, isActive: boolean) => {
    await updateSpecificationStatus(slug, isActive);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Specifications Management</h1>
        <button
          onClick={() => router.push('/admin/specifications/create')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Add New Specification
        </button>
      </div>

      <SpecificationList
        specifications={specifications}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}; 