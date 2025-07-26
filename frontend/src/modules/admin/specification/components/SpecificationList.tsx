import React from 'react';
import { ISpecification } from '../models/specification.model';

interface SpecificationListProps {
  specifications: ISpecification[];
  onEdit: (spec: ISpecification) => void;
  onDelete: (slug: string) => void;
  onStatusChange: (slug: string, isActive: boolean) => void;
}

export const SpecificationList: React.FC<SpecificationListProps> = ({
  specifications,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tên thông số kỹ thuật
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tiêu đề
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nhóm thông số kỹ thuật
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thứ tự
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {specifications.map((spec) => (
            <tr key={spec._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{spec.name}</div>
                <div className="text-sm text-gray-500">{spec.slug}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{spec.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{spec.groups.length} groups</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={spec.isActive.toString()}
                  onChange={(e) => onStatusChange(spec.slug, e.target.value === 'true')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="true">Hoạt động</option>
                  <option value="false">Không hoạt động</option>
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {spec.displayOrder}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(spec)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Sửa
                </button>
                <button
                  onClick={() => onDelete(spec.slug)}
                  className="text-red-600 hover:text-red-900"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 