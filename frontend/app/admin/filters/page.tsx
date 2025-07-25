'use client';

import { useFilters } from '@/modules/admin/filter/hooks/useFilters';
import { deleteFilter } from '@/modules/admin/filter/services/filter.service';
import Link from 'next/link';

const FiltersPage = () => {
  const { filters, loading, refetch } = useFilters();

  const handleDelete = async (id: string) => {
    if (!id) {
      alert('❌ Không thể xoá vì thiếu ID!');
      return;
    }

    const confirmDelete = confirm('❗ Bạn có chắc chắn muốn xoá bộ lọc này không?');
    if (!confirmDelete) return;

    try {
      await deleteFilter(id);
      alert('✅ Bộ lọc đã bị xoá thành công!');
      refetch();
    } catch (error) {
      console.error('❌ Lỗi khi xoá bộ lọc:', error);
      alert('❌ Xoá thất bại, vui lòng thử lại!');
    }
  };

  if (loading) return <p className="p-4 text-gray-600">Đang tải bộ lọc...</p>;

  // Debug log
  console.log('Filters data:', filters);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Quản lý bộ lọc sản phẩm</h1>

      <div className="mb-4">
        <Link
          href="/admin/filters/create"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Thêm bộ lọc mới
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left border-b border-gray-300">STT</th>
              <th className="py-3 px-4 text-left border-b border-gray-300">Tên bộ lọc</th>
              <th className="py-3 px-4 text-left border-b border-gray-300">Loại</th>
              <th className="py-3 px-4 text-left border-b border-gray-300">Tùy chọn</th>
              <th className="py-3 px-4 text-left border-b border-gray-300">Danh mục áp dụng</th>
              <th className="py-3 px-4 text-center border-b border-gray-300">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filters.map((filter, index) => (
              <tr key={filter._id || index} className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b border-gray-200">{index + 1}</td>
                <td className="py-3 px-4 border-b border-gray-200 font-medium">
                  {filter.name}
                </td>
                <td className="py-3 px-4 border-b border-gray-200">
                  {filter.type === 'select' && 'Dropdown'}
                  {filter.type === 'checkbox' && 'Multi-select'}
                  {filter.type === 'range' && 'Khoảng'}
                  {filter.type === 'text' && 'Văn bản'}
                  {filter.type === 'number' && 'Số'}
                </td>
                <td className="py-3 px-4 border-b border-gray-200">
                  <div className="flex flex-wrap gap-1">
                    {filter.options?.map((option, i) => (
                      <span
                        key={i}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded"
                      >
                        {option}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 border-b border-gray-200">
                  {Array.isArray(filter.categories) && filter.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {filter.categories.map((cat: any) => (
                        <span
                          key={cat._id}
                          className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          title={`ID: ${cat._id}`}
                        >
                          {cat.name || 'Không có tên'}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Chưa có danh mục</span>
                  )}
                </td>
                <td className="py-3 px-4 border-b border-gray-200 text-center">
                  <Link
                    href={`/admin/filters/edit/${filter._id}`}
                    className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1 rounded mr-2"
                  >
                    ✏️ Sửa
                  </Link>
                  <button
                    onClick={() => handleDelete(filter._id)}
                    className="inline-block bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded"
                  >
                    🗑️ Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FiltersPage; 