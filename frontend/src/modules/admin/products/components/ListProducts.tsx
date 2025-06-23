"use client";
import React, { useState, useEffect } from "react";
import { useProducts } from "../hooks/useProducts";
import SearchProducts from "./SearchProducts";
import ProductFilters from "./ProductFilters";
import { ProductService } from "../services/product.service";
import Image from "next/image";

interface FilterOption {
  id: string;
  label: string;
  checked: boolean;
}

interface Filters {
  [category: string]: FilterOption[];
}

const defaultFilters: Filters = {
  "Thông tin cơ bản": [
    { id: "thumbnail", label: "Hình ảnh", checked: true },
    { id: "name", label: "Tên sản phẩm", checked: true },
    { id: "sku", label: "Mã SKU", checked: false },
    { id: "shortDescription", label: "Mô tả ngắn", checked: false },
  ],
  "Thông tin giá": [
    { id: "basePrice", label: "Giá cơ bản", checked: true },
    { id: "importPrice", label: "Giá nhập", checked: false },
    { id: "currentPrice", label: "Giá hiện tại", checked: false },
    { id: "discountPrice", label: "Giá khuyến mãi", checked: false },
  ],
  "Thông tin kho": [
    { id: "stockInfo.totalStock", label: "Tổng kho", checked: false },
    {
      id: "stockInfo.lowStockThreshold",
      label: "Ngưỡng cảnh báo",
      checked: false,
    },
    { id: "stockInfo.stockStatus", label: "Trạng thái kho", checked: false },
    { id: "soldCount", label: "Đã bán", checked: false },
  ],
  "Trạng thái": [
    { id: "status", label: "Trạng thái", checked: false },
    { id: "isVisible", label: "Hiển thị", checked: false },
    { id: "isFeatured", label: "Nổi bật", checked: false },
    { id: "isNewArrival", label: "Hàng mới", checked: false },
    { id: "isBestSeller", label: "Bán chạy", checked: false },
  ],
  "Phân loại": [
    { id: "category.main", label: "Danh mục chính", checked: false },
    { id: "category.sub", label: "Danh mục phụ", checked: false },
    { id: "category.tags", label: "Tags", checked: false },
  ],
  "Khuyến mãi": [
    { id: "promotion.isOnSale", label: "Đang giảm giá", checked: false },
    { id: "promotion.saleStartDate", label: "Ngày bắt đầu", checked: false },
    { id: "promotion.saleEndDate", label: "Ngày kết thúc", checked: false },
    { id: "promotion.salePercentage", label: "Phần trăm giảm", checked: false },
  ],
  "Thời gian": [
    { id: "createdAt", label: "Ngày tạo", checked: false },
    { id: "updatedAt", label: "Ngày cập nhật", checked: false },
    { id: "publishedAt", label: "Ngày xuất bản", checked: false },
  ],
};

const ListProducts = () => {
  const {
    products,
    deleteProduct,
    currentPage,
    totalPages,
    fetchProducts,
  } = useProducts();

  // State tìm kiếm
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [, setSearchError] = useState(null);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchCurrentPage, setSearchCurrentPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);

  // State bộ lọc và hiển thị
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  // Load filters from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem("productListFilters");
    if (savedFilters) {
      setFilters(JSON.parse(savedFilters));
    }
  }, []);

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (filterId: string, checked: boolean) => {
    const newFilters = { ...filters };
    for (const category in newFilters) {
      const option = newFilters[category].find((opt) => opt.id === filterId);
      if (option) {
        option.checked = checked;
        break;
      }
    }
    setFilters(newFilters);
    localStorage.setItem("productListFilters", JSON.stringify(newFilters));
  };

  // Lấy danh sách các cột được chọn hiển thị
  const getVisibleColumns = (): string[] => {
    const visibleColumns: string[] = [];
    for (const category in filters) {
      filters[category].forEach((filter) => {
        if (filter.checked) {
          visibleColumns.push(filter.id);
        }
      });
    }
    return visibleColumns;
  };

  // Format giá trị hiển thị cho từng loại dữ liệu
  const formatColumnValue = (columnId: string, value: any) => {
    if (!value && value !== 0) return "—";

    switch (columnId) {
      case "thumbnail":
        return value ? (
          <Image
            src={value}
            alt="Thumbnail"
            className="w-16 h-16 object-cover rounded"
            width={64}
            height={64}
          />
        ) : (
          "Không có ảnh"
        );

      // Giá cả
      case "basePrice":
      case "importPrice":
      case "currentPrice":
      case "discountPrice":
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(value);

      // Thời gian
      case "createdAt":
      case "updatedAt":
      case "publishedAt":
      case "promotion.saleStartDate":
      case "promotion.saleEndDate":
        return value ? new Date(value).toLocaleString("vi-VN") : "—";

      // Trạng thái boolean
      case "isVisible":
      case "isFeatured":
      case "isNewArrival":
      case "isBestSeller":
      case "promotion.isOnSale":
        return value ? "Có" : "Không";

      // Trạng thái sản phẩm
      case "status":
        const statusMap: { [key: string]: string } = {
          draft: "Nháp",
          published: "Đã xuất bản",
          archived: "Đã lưu trữ",
          outOfStock: "Hết hàng",
          comingSoon: "Sắp có hàng",
        };
        return statusMap[value] || value;

      // Trạng thái kho
      case "stockInfo.stockStatus":
        const stockStatusMap: { [key: string]: string } = {
          inStock: "Còn hàng",
          lowStock: "Sắp hết",
          outOfStock: "Hết hàng",
        };
        return stockStatusMap[value] || value;

      // Mảng
      case "category.sub":
      case "category.tags":
        return Array.isArray(value) ? value.join(", ") : value;

      // Phần trăm
      case "promotion.salePercentage":
        return value ? `${value}%` : "—";

      // Các trường nested
      default:
        if (columnId.includes(".")) {
          const [parent, child] = columnId.split(".");
          return value?.[parent]?.[child] ?? "—";
        }
        return value;
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setIsSearchMode(false);
      return;
    }

    setCurrentSearchTerm(searchTerm);
    setIsSearching(true);
    setSearchError(null);
    setIsSearchMode(true);

    try {
      const result = await ProductService.searchByName(searchTerm, 1);
      setSearchResults(result.data as any);
      setSearchTotalPages(result.totalPages);
      setSearchCurrentPage(1);
    } catch (err: any) {
      setSearchError(err.message);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Xử lý phân trang kết quả tìm kiếm
  const handleSearchPagination = async (searchTerm: string, page: number) => {
    setIsSearching(true);
    try {
      const result = await ProductService.searchByName(searchTerm, page);
      setSearchResults(result.data as any);
      setSearchCurrentPage(page);
    } catch (err: any) {
      setSearchError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  // Xử lý xóa sản phẩm
  const handleDelete = async (slug: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      await deleteProduct(slug);
      // Nếu đang ở chế độ tìm kiếm, cập nhật lại kết quả tìm kiếm
      if (isSearchMode) {
        setSearchResults(
          searchResults.filter((product: any) => product.slug !== slug)
        );
      }
    }
  };

  // Sản phẩm hiển thị dựa trên chế độ
  const displayedProducts = isSearchMode ? searchResults : products;
  const displayedCurrentPage = isSearchMode ? searchCurrentPage : currentPage;
  const displayedTotalPages = isSearchMode ? searchTotalPages : totalPages;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Danh sách sản phẩm</h2>
        <div className="flex gap-2">
          <a
            href="/admin/products/create"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
          >
            + Thêm sản phẩm
          </a>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg shadow hover:bg-gray-200 transition"
          >
            Bộ lọc
          </button>
        </div>
      </div>

      <div className="mb-4">
        <SearchProducts
          onSearch={handleSearch}
          isSearching={isSearching}
          placeholder="Nhập tên sản phẩm cần tìm..."
        />
      </div>

      {showFilters && (
        <div className="mb-4">
          <ProductFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left">#</th>
              {getVisibleColumns().map((columnId) => (
                <th key={columnId} className="px-4 py-3 text-left">
                  {
                    filters[
                      Object.keys(filters).find((category) =>
                        filters[category].some((f) => f.id === columnId)
                      ) || ""
                    ].find((f) => f.id === columnId)?.label
                  }
                </th>
              ))}
              <th className="px-4 py-3 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {displayedProducts.map((product: any, index: number) => (
              <tr
                key={product.slug || product.id}
                className="hover:bg-gray-100 transition"
              >
                <td className="px-4 py-2">{index + 1}</td>
                {getVisibleColumns().map((columnId) => (
                  <td key={columnId} className="px-4 py-2">
                    {formatColumnValue(columnId, product[columnId])}
                  </td>
                ))}
                <td className="px-4 py-2 flex gap-2">
                  <a
                    href={`/san-pham/${product.slug}`}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs"
                  >
                    Xem
                  </a>
                  <a
                    href={`/admin/products/edit/${product.slug}`}
                    className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-xs"
                  >
                    Sửa
                  </a>
                  <button
                    onClick={() => handleDelete(product.slug)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="flex items-center justify-center mt-6 gap-4">
        <button
          disabled={displayedCurrentPage === 1}
          onClick={() => {
            if (isSearchMode) {
              handleSearchPagination(
                currentSearchTerm,
                displayedCurrentPage - 1
              );
            } else {
              fetchProducts(displayedCurrentPage - 1);
            }
          }}
          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
        >
          Trang trước
        </button>
        <span>
          Trang {displayedCurrentPage} / {displayedTotalPages}
        </span>
        <button
          disabled={displayedCurrentPage >= displayedTotalPages}
          onClick={() => {
            if (isSearchMode) {
              handleSearchPagination(
                currentSearchTerm,
                displayedCurrentPage + 1
              );
            } else {
              fetchProducts(displayedCurrentPage + 1);
            }
          }}
          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
        >
          Trang sau
        </button>
      </div>
    </div>
  );
};

export default ListProducts;
