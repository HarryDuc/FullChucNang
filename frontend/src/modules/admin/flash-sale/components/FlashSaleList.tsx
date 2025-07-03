"use client";

import React, { useEffect, useState } from "react";
import { useFlashSaleProducts } from "../hooks/useFlashSaleProducts";
import Image from "next/image";
import { DeleteFlashSaleDialog } from "./DeleteFlashSaleDialog";
import { AddFlashSaleDialog } from "./AddFlashSaleDialog";
import Link from "next/link";
import SearchProducts from "./SearchProducts";

export const FlashSaleList = () => {
  const { products, page, totalPages, loading, error, fetchProducts } =
    useFlashSaleProducts();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (term: string, page?: number) => {
    setSearchTerm(term);
    setIsSearching(true);
  };
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePageChange = (newPage: number) => {
    fetchProducts(newPage);
  };

  const handleDelete = (slug: string) => {
    setSelectedProduct(slug);
    setIsDeleteDialogOpen(true);
  };

  const handleAdd = () => {
    setIsAddDialogOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return <div className="flex justify-center p-4">Đang tải...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center p-4 text-red-500">
        Có lỗi xảy ra: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Danh sách Flash Sale</h2>
        <Link
          href="/admin/flash-sale/add"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Thêm sản phẩm
        </Link>
      </div>
      <SearchProducts
        onSearch={handleSearch}
        isSearching={isSearching}
        placeholder="Tìm kiếm sản phẩm để thêm vào flash sale..."
      />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hình ảnh
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên sản phẩm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giá gốc
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giá Flash Sale
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative w-16 h-16">
                    <Image
                      src={product.thumbnail}
                      alt={product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{product.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatPrice(product.currentPrice)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatPrice(product.discountPrice || 0)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowDropdown(
                          showDropdown === product._id ? null : product._id
                        )
                      }
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                    {showDropdown === product._id && (
                      <div className="absolute right-8 -mt-12 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                        <div className="py-1 flex flex-col gap-2">
                          <Link
                            href={`/admin/products/edit/${product.slug}`}
                            className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                          >
                            Sửa sản phẩm
                          </Link>
                          <button
                            onClick={() => {
                              handleDelete(product.slug);
                              setShowDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            <svg
                              className="inline-block h-4 w-4 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Hủy Flash Sale
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 rounded ${
                  pageNum === page
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {pageNum}
              </button>
            )
          )}
        </div>
      )}

      {isDeleteDialogOpen && (
        <DeleteFlashSaleDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          slug={selectedProduct}
          onDeleted={() => {
            fetchProducts(page);
            setIsDeleteDialogOpen(false);
          }}
        />
      )}

      {isAddDialogOpen && (
        <AddFlashSaleDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAdded={() => {
            fetchProducts(page);
            setIsAddDialogOpen(false);
          }}
        />
      )}
    </div>
  );
};
