
export default function FilterSection({
    sortOption,
    onSortChange,
  }: {
    sortOption: string;
    onSortChange: (value: string) => void;
    categoryId?: string;
    onFilterChange: (filters: Record<string, any>) => void;
    selectedFilters: Record<string, any>;
    loading: boolean;
  }) {
    return (
      <div className="flex flex-col lg:flex-row gap-4 mb-4">

          <div className="flex justify-end mb-2">
            <label className="sr-only">Sắp xếp theo</label>
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-48 border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="default">Mặc định</option>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
            </select>
          </div>
      </div>
    );
  }
  