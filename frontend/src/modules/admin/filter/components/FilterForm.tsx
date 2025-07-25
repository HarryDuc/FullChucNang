'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, CreateFilterDto, RangeOption } from '../types/filter.types';
import { CategoriesProduct } from '../../categories-product/types/categories-product.types';
import { getCategoriesProduct } from '../../categories-product/services/categories-product.service';

interface Props {
  filter?: Filter;
  onSuccess: (data: CreateFilterDto) => void;
}

const FilterForm: React.FC<Props> = ({ filter, onSuccess }) => {
  const router = useRouter();
  const [name, setName] = useState(filter?.name || '');
  const [type, setType] = useState<Filter['type']>(filter?.type || 'select');
  const [options, setOptions] = useState<string[]>(filter?.options || []);
  const [rangeOptions, setRangeOptions] = useState<RangeOption[]>(
    filter?.rangeOptions || []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    Array.isArray(filter?.categories)
      ? filter.categories.map((cat) =>
          typeof cat === 'string'
            ? cat
            : (cat as { _id?: string })._id ?? ''
        )
      : []
  );
  const [newOption, setNewOption] = useState('');
  const [categories, setCategories] = useState<CategoriesProduct[]>([]);

  // State cho range option mới
  const [newRangeOption, setNewRangeOption] = useState<RangeOption>({
    label: '',
    min: 0,
    max: 0
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategoriesProduct();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  // Reset form khi thay đổi type
  useEffect(() => {
    if (type === 'range') {
      setOptions([]);
    } else {
      setRangeOptions([]);
    }
  }, [type]);

  const handleAddOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleAddRangeOption = () => {
    if (newRangeOption.label && newRangeOption.max > newRangeOption.min) {
      setRangeOptions([...rangeOptions, { ...newRangeOption }]);
      setNewRangeOption({ label: '', min: 0, max: 0 });
    }
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleRemoveRangeOption = (index: number) => {
    setRangeOptions(rangeOptions.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate range options
    if (type === 'range' && rangeOptions.length === 0) {
      alert('Bạn phải thêm ít nhất một khoảng giá cho bộ lọc range');
      return;
    }

    const filterData: CreateFilterDto = {
      name,
      type,
      options: type === 'range' ? [] : options,
      rangeOptions: type === 'range' ? rangeOptions : [],
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    };

    console.log('Submitting filter data:', filterData);
    onSuccess(filterData);
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col">
        <label htmlFor="name" className="mb-1 text-gray-700 font-medium">
          Tên bộ lọc
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ví dụ: Màu sắc, Kích thước..."
          required
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="type" className="mb-1 text-gray-700 font-medium">
          Loại bộ lọc
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as Filter['type'])}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
        >
          <option value="select">Select (Dropdown)</option>
          <option value="checkbox">Checkbox (Multi-select)</option>
          <option value="range">Range (Khoảng giá)</option>
          <option value="text">Text (Văn bản)</option>
          <option value="number">Number (Số)</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="mb-1 text-gray-700 font-medium">
          Danh mục sản phẩm (có thể chọn nhiều)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 border border-gray-300 rounded max-h-60 overflow-y-auto">
          {categories.map((cat) => (
            <div key={cat._id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`cat-${cat._id}`}
                checked={selectedCategories.includes(cat._id)}
                onChange={() => handleCategoryChange(cat._id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor={`cat-${cat._id}`} className="text-sm">
                {cat.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {type === 'range' ? (
        <div className="flex flex-col">
          <label className="mb-1 text-gray-700 font-medium">Khoảng giá</label>
          <div className="space-y-4">
            {/* Form thêm khoảng giá mới */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600">Nhãn</label>
                <input
                  type="text"
                  value={newRangeOption.label}
                  onChange={(e) =>
                    setNewRangeOption({ ...newRangeOption, label: e.target.value })
                  }
                  placeholder="Ví dụ: Dưới 500k"
                  className="mt-1 w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Giá từ</label>
                <input
                  type="number"
                  value={newRangeOption.min}
                  onChange={(e) =>
                    setNewRangeOption({
                      ...newRangeOption,
                      min: Number(e.target.value)
                    })
                  }
                  min="0"
                  className="mt-1 w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Đến</label>
                <input
                  type="number"
                  value={newRangeOption.max}
                  onChange={(e) =>
                    setNewRangeOption({
                      ...newRangeOption,
                      max: Number(e.target.value)
                    })
                  }
                  min="0"
                  className="mt-1 w-full p-2 border rounded"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddRangeOption}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Thêm khoảng giá
            </button>

            {/* Danh sách khoảng giá */}
            <div className="space-y-2">
              {rangeOptions.map((range, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded"
                >
                  <div>
                    <span className="font-medium">{range.label}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({formatPrice(range.min)} - {formatPrice(range.max)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRangeOption(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <label className="mb-1 text-gray-700 font-medium">Tùy chọn lọc</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="Nhập tùy chọn mới"
              className="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            />
            <button
              type="button"
              onClick={handleAddOption}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Thêm
            </button>
          </div>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                <span className="flex-1">{option}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded transition-colors"
        >
          {filter ? 'Cập nhật' : 'Tạo bộ lọc'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/filters')}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded transition-colors"
        >
          Quay lại
        </button>
      </div>
    </form>
  );
};

export default FilterForm; 