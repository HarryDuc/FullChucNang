'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FilterForm from '@/modules/admin/filter/components/FilterForm';
import { getFilterById, updateFilter } from '@/modules/admin/filter/services/filter.service';
import { Filter, UpdateFilterDto } from '@/modules/admin/filter/types/filter.types';

const EditFilterPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [filter, setFilter] = useState<Filter | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFilter = async () => {
      if (id) {
        try {
          const data = await getFilterById(id);
          setFilter(data);
        } catch (error) {
          console.error('❌ Lỗi khi tải thông tin bộ lọc:', error);
          alert('❌ Không thể tải thông tin bộ lọc. Vui lòng thử lại.');
        }
      }
    };
    fetchFilter();
  }, [id]);

  const handleUpdate = async (data: UpdateFilterDto) => {
    if (!filter) return;
    setLoading(true);
    try {
      await updateFilter(filter._id, data);
      alert('✅ Cập nhật bộ lọc thành công!');
      router.push('/admin/filters');
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật bộ lọc:', error);
      alert('❌ Lỗi khi cập nhật bộ lọc. Vui lòng thử lại.');
    }
    setLoading(false);
  };

  if (!filter) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-gray-700">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Chỉnh sửa bộ lọc: {filter.name}
      </h1>
      <FilterForm filter={filter} onSuccess={handleUpdate} />
      {loading && (
        <p className="mt-4 text-yellow-600 font-medium">⏳ Đang xử lý...</p>
      )}
    </div>
  );
};

export default EditFilterPage; 