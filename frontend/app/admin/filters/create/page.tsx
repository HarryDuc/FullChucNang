'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FilterForm from '@/modules/admin/filter/components/FilterForm';
import { createFilter } from '@/modules/admin/filter/services/filter.service';
import { CreateFilterDto } from '@/modules/admin/filter/types/filter.types';

const CreateFilterPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (data: CreateFilterDto) => {
    setLoading(true);
    try {
      await createFilter(data);
      alert('🎉 Tạo bộ lọc thành công!');
      router.push('/admin/filters');
    } catch (error) {
      console.error('❌ Lỗi khi tạo bộ lọc:', error);
      alert('❌ Lỗi khi tạo bộ lọc. Vui lòng thử lại.');
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Tạo bộ lọc sản phẩm mới
      </h1>

      <div className="rounded-xl">
        <FilterForm onSuccess={handleCreate} />
        {loading && (
          <p className="mt-4 text-yellow-600 font-medium">⏳ Đang xử lý...</p>
        )}
      </div>
    </div>
  );
};

export default CreateFilterPage; 