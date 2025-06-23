"use client";

import React, { useEffect } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { usePage } from "../hooks/usePage";
import { IPage } from "../services/page.service";
import { useRouter } from "next/navigation";

interface PageListProps {
  className?: string;
}

export const PageList: React.FC<PageListProps> = ({ className = "" }) => {
  const router = useRouter();
  const { pages, loading, fetchPages, deletePage } = usePage();

  useEffect(() => {
    fetchPages();
  }, []);

  const handleEdit = (page: IPage) => {
    router.push(`/admin/create-page/edit/${page.slug}`);
  };

  const handleCreate = () => {
    router.push("/admin/create-page/create");
  };

  const handleDelete = async (page: IPage) => {
    if (!page.slug) return;

    if (window.confirm("Are you sure you want to delete this page?")) {
      await deletePage(page.slug);
      await fetchPages(); // Refresh the list after deletion
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Pages</h2>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Page
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pages.map((page) => (
              <tr key={page.slug} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{page.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{page.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(page.createdAt!).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEdit(page)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Edit"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(page)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No pages found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
