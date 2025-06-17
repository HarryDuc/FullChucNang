import React from "react";

interface FilterOption {
  id: string;
  label: string;
  checked: boolean;
}

interface ProductFiltersProps {
  filters: {
    [key: string]: FilterOption[];
  };
  onFilterChange: (filterId: string, checked: boolean) => void;
}

const ProductFilters = ({ filters, onFilterChange }: ProductFiltersProps) => {
  // Kiểm tra xem tất cả các option trong một category có được chọn không
  const isAllChecked = (options: FilterOption[]) => {
    return options.every((option) => option.checked);
  };

  // Xử lý khi click vào "Chọn tất cả" của một category
  const handleSelectAll = (category: string, checked: boolean) => {
    filters[category].forEach((option) => {
      onFilterChange(option.id, checked);
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(filters).map(([category, options]) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">{category}</div>
              <button
                onClick={() =>
                  handleSelectAll(category, !isAllChecked(options))
                }
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {isAllChecked(options) ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </button>
            </div>
            <div className="space-y-1">
              {options.map((option) => (
                <div key={option.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={option.id}
                    checked={option.checked}
                    onChange={(e) =>
                      onFilterChange(option.id, e.target.checked)
                    }
                    className="w-3 h-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={option.id}
                    className="ml-2 text-xs text-gray-700 cursor-pointer hover:text-gray-900"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductFilters;
