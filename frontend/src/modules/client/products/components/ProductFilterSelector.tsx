'use client';

import React, { useEffect } from 'react';
import { useCategoryFilters, CategoryFilter } from '../../../admin/products/hooks/useCategoryFilters';

interface Props {
  categoryId?: string;
  selectedFilters: Record<string, any>;
  onChange: (filters: Record<string, any>) => void;
}

const ProductFilterSelector: React.FC<Props> = ({
  categoryId,
  selectedFilters,
  onChange,
}) => {
  const { filters, loading, error } = useCategoryFilters(categoryId);

  // Log khi filters hoặc selectedFilters thay đổi
  useEffect(() => {
    console.log('Available filters:', filters);
    console.log('Selected filters:', selectedFilters);
  }, [filters, selectedFilters]);

  const handleFilterChange = (filter: CategoryFilter, value: any) => {
    console.log('Changing filter:', filter.slug, 'to value:', value);
    
    // Remove filter if value is empty
    if (value === '' || (Array.isArray(value) && value.length === 0)) {
      const newFilters = { ...selectedFilters };
      delete newFilters[filter.slug];
      onChange(newFilters);
    } else {
      // Otherwise add/update the filter
      onChange({
        ...selectedFilters,
        [filter.slug]: value,
      });
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  if (!categoryId) {
    return null;
  }

  if (loading) {
    return <div className="text-gray-500">Đang tải bộ lọc...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!filters.length) {
    return <div className="text-gray-500">Danh mục này chưa có bộ lọc</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-6">
        {filters.map((filter) => (
          <div key={filter._id} className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              {filter.name}
            </label>
            {filter.type === 'select' && (
              <select
                value={selectedFilters[filter.slug] || ''}
                onChange={(e) => handleFilterChange(filter, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn {filter.name}</option>
                {filter.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
            {filter.type === 'checkbox' && (
              <div className="space-y-2">
                {filter.options.map((option) => {
                  const values = (selectedFilters[filter.slug] || []) as string[];
                  return (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={values.includes(option)}
                        onChange={(e) => {
                          const newValues = e.target.checked
                            ? [...values, option]
                            : values.filter((v) => v !== option);
                          handleFilterChange(filter, newValues);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  );
                })}
              </div>
            )}
            {filter.type === 'range' && (
              <div className="space-y-4">
                {/* Khoảng giá định sẵn */}
                {filter.rangeOptions && filter.rangeOptions.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500 mb-2">Khoảng giá định sẵn</div>
                    {filter.rangeOptions.map((range, index) => (
                      <label
                        key={index}
                        className="flex items-center p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={`range-${filter._id}`}
                          checked={
                            selectedFilters[filter.slug]?.min === range.min &&
                            selectedFilters[filter.slug]?.max === range.max
                          }
                          onChange={() =>
                            handleFilterChange(filter, {
                              min: range.min,
                              max: range.max,
                              isPreset: true
                            })
                          }
                          className="form-radio h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {range.label}
                          <span className="text-gray-500 text-xs ml-1">
                            ({formatPrice(range.min)} - {formatPrice(range.max)})
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Khoảng giá tùy chọn */}
                <div>
                  <div className="text-sm text-gray-500 mb-2">Khoảng giá tùy chọn</div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={selectedFilters[filter.slug]?.min || ''}
                      onChange={(e) =>
                        handleFilterChange(filter, {
                          ...selectedFilters[filter.slug],
                          min: e.target.value ? Number(e.target.value) : undefined,
                          isPreset: false
                        })
                      }
                      placeholder="Từ"
                      min="0"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      value={selectedFilters[filter.slug]?.max || ''}
                      onChange={(e) =>
                        handleFilterChange(filter, {
                          ...selectedFilters[filter.slug],
                          max: e.target.value ? Number(e.target.value) : undefined,
                          isPreset: false
                        })
                      }
                      placeholder="Đến"
                      min="0"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Hiển thị khoảng giá đã chọn */}
                {selectedFilters[filter.slug]?.min !== undefined && (
                  <div className="text-sm text-blue-600">
                    Đã chọn: {formatPrice(selectedFilters[filter.slug].min)} - {formatPrice(selectedFilters[filter.slug].max)}
                  </div>
                )}
              </div>
            )}
            {(filter.type === 'text' || filter.type === 'number') && (
              <input
                type={filter.type}
                value={selectedFilters[filter.slug] || ''}
                onChange={(e) => handleFilterChange(filter, e.target.value)}
                placeholder={`Nhập ${filter.name.toLowerCase()}`}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductFilterSelector; 