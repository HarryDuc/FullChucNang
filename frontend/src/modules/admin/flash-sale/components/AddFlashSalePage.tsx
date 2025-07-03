"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFlashSaleProducts } from "../hooks/useFlashSaleProducts";
import { ProductService } from "../../products/services/product.service";
import { Product } from "../../products/models/product.model";
import SearchProducts from "./SearchProducts";

const ITEMS_PER_PAGE = 12;

export const AddFlashSalePage = () => {
  const router = useRouter();
  const { updateProduct } = useFlashSaleProducts();

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [discountPercentage, setDiscountPercentage] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [existingFlashSaleProducts, setExistingFlashSaleProducts] = useState<
    Product[]
  >([]);
  const [formErrors, setFormErrors] = useState({
    products: "",
    discountPercentage: "",
  });

  // Thêm state cho tìm kiếm
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [searchCurrentPage, setSearchCurrentPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);

  // Fetch sản phẩm với phân trang
  useEffect(() => {
    if (!isSearchMode) {
      fetchProducts(currentPage);
    }
  }, [currentPage, isSearchMode]);

  const fetchProducts = async (page: number) => {
    setLoading(true);
    try {
      // Lấy tất cả sản phẩm
      const result = await ProductService.getAll(page, ITEMS_PER_PAGE);

      // Lấy danh sách sản phẩm flash sale hiện có
      const flashSaleResult = await ProductService.getByCategory(
        "Flash Sale",
        1,
        1000
      );
      setExistingFlashSaleProducts(flashSaleResult.data as Product[]);

      // Lọc ra những sản phẩm không thuộc flash-sale và cập nhật trạng thái
      const allProducts = result.data.map((product) => ({
        ...product,
        isInFlashSale:
          (product.category?.main || "").includes("Flash Sale") ||
          flashSaleResult.data.some((fp) => fp.slug === product.slug),
      }));

      setProducts(allProducts);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      setError("Không thể lấy danh sách sản phẩm. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = async (searchTerm: string, page: number = 1) => {
    if (!searchTerm.trim()) {
      setIsSearchMode(false);
      fetchProducts(currentPage);
      return;
    }

    setCurrentSearchTerm(searchTerm);
    setIsSearching(true);
    setIsSearchMode(true);

    try {
      const result = await ProductService.searchByName(searchTerm, page);

      // Lọc ra những sản phẩm không thuộc flash-sale
      const filteredProducts = result.data.map((product: Product) => ({
        ...product,
        isInFlashSale: existingFlashSaleProducts.some(
          (fp) => fp.slug === product.slug
        ),
      }));

      setSearchResults(filteredProducts);
      setSearchTotalPages(result.totalPages);
      setSearchCurrentPage(page);
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
      setError("Không thể tìm kiếm sản phẩm. Vui lòng thử lại sau.");
    } finally {
      setIsSearching(false);
    }
  };

  // Xử lý phân trang khi tìm kiếm
  const handleSearchPagination = async (page: number) => {
    if (!isSearchMode || !currentSearchTerm) return;
    handleSearch(currentSearchTerm, page);
  };

  // Cập nhật hàm xử lý phân trang
  const handlePageChange = (page: number) => {
    if (isSearchMode) {
      handleSearchPagination(page);
    } else {
      setCurrentPage(page);
    }
  };

  // Sản phẩm hiển thị dựa trên chế độ
  const displayedProducts = isSearchMode ? searchResults : products;
  const displayedCurrentPage = isSearchMode ? searchCurrentPage : currentPage;
  const displayedTotalPages = isSearchMode ? searchTotalPages : totalPages;

  const validateForm = () => {
    const errors = {
      products: "",
      discountPercentage: "",
    };
    let isValid = true;

    if (selectedProducts.length === 0) {
      errors.products = "Vui lòng chọn ít nhất một sản phẩm";
      isValid = false;
    }

    // if (!discountPercentage) {
    //   errors.discountPercentage = "Vui lòng nhập phần trăm giảm giá";
    //   isValid = false;
    // } else {
    //   const percentage = Number(discountPercentage);
    //   if (isNaN(percentage) || percentage <= 0 || percentage >= 100) {
    //     errors.discountPercentage = "Phần trăm giảm giá phải từ 1-99";
    //     isValid = false;
    //   }
    // }

    setFormErrors(errors);
    return isValid;
  };

  const handleProductSelect = (
    product: Product & { isInFlashSale?: boolean }
  ) => {
    if (product.isInFlashSale) {
      return; // Không cho phép chọn sản phẩm đã có trong flash sale
    }

    setSelectedProducts((prev) => {
      const exists = prev.some((p) => p.slug === product.slug);
      if (exists) {
        return prev.filter((p) => p.slug !== product.slug);
      } else {
        return [...prev, product];
      }
    });
    if (formErrors.products) {
      setFormErrors((prev) => ({ ...prev, products: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const percentage = Number(discountPercentage) / 100;

      // Cập nhật tất cả sản phẩm đã chọn thành flash sale
      const updatePromises = selectedProducts.map(async (product) => {
        try {
          // const discountPrice = Math.round(
          //   (product.currentPrice || 0) * (1 - percentage)
          // );

          // Thêm "Flash Sale" vào danh sách category.main hiện có
          const currentMainCategories = (product.category?.main || "")
            .split(",")
            .map((cat) => cat.trim());
          const newMainCategories = [
            ...new Set([...currentMainCategories, "Flash Sale"]),
          ];

          const flashSaleProduct = {
            ...product,
            // discountPrice,
            category: {
              ...product.category,
              main: newMainCategories.join(", "), // Giữ lại tất cả danh mục cũ và thêm Flash Sale
              sub: product.category?.sub || [],
              tags: product.category?.tags || [],
            },
          };

          await updateProduct(product.slug, flashSaleProduct);
        } catch (error) {
          console.error(`Lỗi khi cập nhật sản phẩm ${product.slug}:`, error);
          throw error;
        }
      });

      await Promise.all(updatePromises);
      router.push("/admin/flash-sale"); // Chuyển về trang danh sách sau khi thêm thành công
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm vào flash sale:", error);
      setError(
        "Không thể thêm sản phẩm vào flash sale. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Thêm Sản Phẩm Flash Sale</h1>
        <button
          onClick={() => router.push("/admin/flash-sale")}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Quay lại
        </button>
      </div>

      <SearchProducts
        onSearch={handleSearch}
        isSearching={isSearching}
        placeholder="Tìm kiếm sản phẩm để thêm vào flash sale..."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          {/* <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phần trăm giảm giá (%)
            </label>
            <input
              type="number"
              value={discountPercentage}
              onChange={(e) => {
                setDiscountPercentage(e.target.value);
                if (formErrors.discountPercentage) {
                  setFormErrors((prev) => ({
                    ...prev,
                    discountPercentage: "",
                  }));
                }
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Nhập phần trăm giảm giá (1-99)"
              min="1"
              max="99"
            />
            {formErrors.discountPercentage && (
              <p className="mt-1 text-sm text-red-600">
                {formErrors.discountPercentage}
              </p>
            )}
          </div> */}

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">
                Danh sách sản phẩm ({selectedProducts.length} đã chọn)
              </h2>
              {formErrors.products && (
                <p className="text-sm text-red-600">{formErrors.products}</p>
              )}
            </div>

            {loading || isSearching ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Chọn
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Sản phẩm
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Giá gốc
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Giá giảm giá
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayedProducts.map((product) => (
                        <tr
                          key={product.slug}
                          className={`hover:bg-gray-50 ${
                            (product as any).isInFlashSale ? "opacity-50" : ""
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedProducts.some(
                                (p) => p.slug === product.slug
                              )}
                              onChange={() => handleProductSelect(product)}
                              disabled={(product as any).isInFlashSale}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {product.thumbnail && (
                                <img
                                  src={product.thumbnail}
                                  alt={product.name}
                                  className="h-10 w-10 object-cover rounded-md mr-3"
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {product.slug}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(product.currentPrice || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(product.discountPrice || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cập nhật phân trang */}
                <div className="flex justify-between items-center mt-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(displayedCurrentPage - 1)}
                      disabled={displayedCurrentPage === 1}
                      className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                      Trước
                    </button>
                    <span className="px-3 py-1">
                      Trang {displayedCurrentPage} / {displayedTotalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(displayedCurrentPage + 1)}
                      disabled={displayedCurrentPage === displayedTotalPages}
                      className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push("/admin/flash-sale")}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Đang thêm..." : "Thêm vào Flash Sale"}
          </button>
        </div>
      </form>
    </div>
  );
};
