import ProductFilterSelector from "@/modules/client/products/components/ProductFilterSelector";

export default function Filter({ categoryId, selectedFilters, onFilterChange, loading }: { categoryId: string, selectedFilters: any, onFilterChange: any, loading: boolean }) {
    return (
        <div>
          {categoryId && (
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Bộ lọc sản phẩm</h3>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <ProductFilterSelector
                    categoryId={categoryId}
                    selectedFilters={selectedFilters}
                    onChange={onFilterChange}
                  />
                  
                  {/* Hiển thị các bộ lọc đã chọn */}
                  {Object.keys(selectedFilters).length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Bộ lọc đã chọn</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedFilters).map(([key, value]: [string, any]) => (
                          <div
                            key={key}
                            className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-50 text-blue-700"
                          >
                            <span>{typeof value === 'object' ? `${value.min} - ${value.max}` : value}</span>
                            <button
                              onClick={() => {
                                const newFilters = { ...selectedFilters };
                                delete newFilters[key];
                                onFilterChange(newFilters);
                              }}
                              className="ml-1 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => onFilterChange({})}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Xóa tất cả
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
    );
}