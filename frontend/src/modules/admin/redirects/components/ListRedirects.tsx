"use client";

import React, { useState } from "react";
import { useRedirectData } from "../hooks/useRedirectData";
import { Redirect } from "../models/redirect.model";
import RedirectForm from "./RedirectForm";
import RedirectFilters from "./RedirectFilters";
import { toast } from 'react-toastify';

const ListRedirects: React.FC = () => {
  const {
    redirects,
    loading,
    pagination,
    handleTableChange,
    handleFilter,
    handleDeleteRedirect,
    checkRedirect,
    refresh
  } = useRedirectData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Tạo Redirect mới");
  const [currentRedirectId, setCurrentRedirectId] = useState<string | undefined>(undefined);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testPath, setTestPath] = useState("");
  const [testResult, setTestResult] = useState<Redirect | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleCreateNew = () => {
    setCurrentRedirectId(undefined);
    setModalTitle("Tạo Redirect mới");
    setIsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    setCurrentRedirectId(id);
    setModalTitle("Sửa Redirect");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const success = await handleDeleteRedirect(id);
    if (success) {
      setShowDeleteConfirm(null);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    refresh();
  };

  const handleTestRedirect = async () => {
    if (!testPath) {
      toast.warning("Vui lòng nhập đường dẫn để kiểm tra");
      return;
    }

    const path = testPath.startsWith("/") ? testPath : `/${testPath}`;

    setTestLoading(true);
    try {
      const result = await checkRedirect(path);
      setTestResult(result);
      if (!result) {
        toast.info("Không tìm thấy redirect cho đường dẫn này");
      }
    } catch (error) {
      toast.error("Lỗi khi kiểm tra redirect");
    } finally {
      setTestLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    // Kiểm tra xem trình duyệt có hỗ trợ Clipboard API không
    if (!navigator.clipboard) {
      // Fallback cho trình duyệt không hỗ trợ Clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        textArea.remove();
        toast.success('Đã sao chép vào clipboard');
      } catch (err) {
        console.error('Fallback: Không thể sao chép text: ', err);
        toast.error('Không thể sao chép vào clipboard');
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success('Đã sao chép vào clipboard');
    } catch (err) {
      console.error('Không thể sao chép text: ', err);
      toast.error('Không thể sao chép vào clipboard. Vui lòng thử lại sau.');
    }
  };

  const getStatusColor = (type: string) => {
    const colorMap: Record<string, string> = {
      product: "bg-blue-100 text-blue-800",
      post: "bg-purple-100 text-purple-800",
      category: "bg-green-100 text-green-800",
      page: "bg-orange-100 text-orange-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colorMap[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý Redirects</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTestModalOpen(true)}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Kiểm tra Redirect
          </button>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm mới
          </button>
        </div>
      </div>

      <RedirectFilters onFilter={handleFilter} />

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đường dẫn cũ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đường dẫn mới
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lượt hit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {redirects.map((redirect) => (
              <tr key={redirect._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(window.location.origin + redirect.oldPath)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <span className="truncate max-w-xs" title={redirect.oldPath}>
                      {redirect.oldPath}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(window.location.origin + redirect.newPath)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <span className="truncate max-w-xs" title={redirect.newPath}>
                      {redirect.newPath}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(redirect.type)}`}>
                    {redirect.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    redirect.statusCode === 301 || redirect.statusCode === 308
                      ? "bg-green-100 text-green-800"
                      : "bg-orange-100 text-orange-800"
                  }`}>
                    {redirect.statusCode}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1 ${
                    redirect.isActive
                      ? "text-green-600"
                      : "text-red-600"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      redirect.isActive
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}></span>
                    {redirect.isActive ? "Kích hoạt" : "Vô hiệu"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {redirect.hitCount}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(redirect._id)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {showDeleteConfirm === redirect._id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(redirect._id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          Xác nhận
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDeleteConfirm(redirect._id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div className="flex items-center">
          <span className="text-sm text-gray-700">
            Hiển thị {((pagination.current - 1) * pagination.pageSize) + 1} đến{" "}
            {Math.min(pagination.current * pagination.pageSize, pagination.total)} trong số{" "}
            {pagination.total} kết quả
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleTableChange({ current: pagination.current - 1, pageSize: pagination.pageSize })}
            disabled={pagination.current === 1}
            className={`px-3 py-1 rounded ${
              pagination.current === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 border"
            }`}
          >
            Trước
          </button>
          <button
            onClick={() => handleTableChange({ current: pagination.current + 1, pageSize: pagination.pageSize })}
            disabled={pagination.current * pagination.pageSize >= pagination.total}
            className={`px-3 py-1 rounded ${
              pagination.current * pagination.pageSize >= pagination.total
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 border"
            }`}
          >
            Sau
          </button>
        </div>
      </div>

      {/* Test Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Kiểm tra Redirect</h3>
              <button
                onClick={() => {
                  setTestModalOpen(false);
                  setTestPath("");
                  setTestResult(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">{window.location.origin}</span>
                <input
                  type="text"
                  placeholder="/duong-dan-can-kiem-tra"
                  value={testPath}
                  onChange={(e) => setTestPath(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleTestRedirect()}
                  className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {testResult && (
                <div className="mt-4 border p-4 rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Kết quả:</div>
                    <div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        Tìm thấy redirect
                      </span>
                    </div>
                    
                    <div className="font-medium">Chuyển hướng đến:</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{testResult.newPath}</span>
                      <button
                        onClick={() => copyToClipboard(testResult.newPath)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="font-medium">Loại:</div>
                    <div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(testResult.type)}`}>
                        {testResult.type}
                      </span>
                    </div>
                    
                    <div className="font-medium">Mã trạng thái:</div>
                    <div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        testResult.statusCode === 301 || testResult.statusCode === 308
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}>
                        {testResult.statusCode}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setTestModalOpen(false);
                    setTestPath("");
                    setTestResult(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Đóng
                </button>
                <button
                  onClick={handleTestRedirect}
                  disabled={testLoading}
                  className={`px-4 py-2 text-white rounded ${
                    testLoading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {testLoading ? "Đang kiểm tra..." : "Kiểm tra"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{modalTitle}</h3>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <RedirectForm
              redirectId={currentRedirectId}
              onSuccess={handleSuccess}
              onCancel={handleModalClose}
              onRefresh={refresh}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ListRedirects; 