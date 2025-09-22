"use client";

import { useState } from 'react';
import { useEmailConfig } from '../hooks/useEmailConfig';
import { EmailConfig } from '../services/email-config.service';

const EmailConfigSettings = () => {
  const {
    config,
    loading,
    error,
    updating,
    updateConfig,
    toggleEmailSystem,
    toggleUserEmails,
    toggleAdminEmails,
    addAdminEmail,
    removeAdminEmail,
  } = useEmailConfig();

  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleToggleEmailSystem = async () => {
    if (!config) return;
    try {
      await toggleEmailSystem(!config.emailEnabled);
      showSuccessMessage(`Hệ thống email đã được ${!config.emailEnabled ? 'bật' : 'tắt'}`);
    } catch (error) {
      console.error('Error toggling email system:', error);
    }
  };

  const handleToggleUserEmails = async () => {
    if (!config) return;
    try {
      await toggleUserEmails(!config.sendUserOrderConfirmation, !config.sendUserPaymentSuccess);
      showSuccessMessage('Cấu hình email user đã được cập nhật');
    } catch (error) {
      console.error('Error toggling user emails:', error);
    }
  };

  const handleToggleAdminEmails = async () => {
    if (!config) return;
    try {
      await toggleAdminEmails(!config.sendAdminOrderNotification, !config.sendAdminPaymentSuccess);
      showSuccessMessage('Cấu hình email admin đã được cập nhật');
    } catch (error) {
      console.error('Error toggling admin emails:', error);
    }
  };

  const handleAddAdminEmail = async () => {
    if (!newAdminEmail.trim()) return;
    try {
      await addAdminEmail(newAdminEmail.trim());
      setNewAdminEmail('');
      showSuccessMessage(`Email admin ${newAdminEmail} đã được thêm`);
    } catch (error) {
      console.error('Error adding admin email:', error);
    }
  };

  const handleRemoveAdminEmail = async (email: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa email admin ${email}?`)) return;
    try {
      await removeAdminEmail(email);
      showSuccessMessage(`Email admin ${email} đã được xóa`);
    } catch (error) {
      console.error('Error removing admin email:', error);
    }
  };

  const handleUpdateConfig = async (field: keyof EmailConfig, value: any) => {
    if (!config) return;
    try {
      await updateConfig({ [field]: value });
      showSuccessMessage('Cấu hình đã được cập nhật');
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Đang tải cấu hình email...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Lỗi tải cấu hình email</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="text-sm text-yellow-700">Không tìm thấy cấu hình email</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Master Switch */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Hệ thống Email</h3>
            <p className="text-sm text-gray-500">Bật/tắt toàn bộ hệ thống gửi email</p>
          </div>
          <button
            onClick={handleToggleEmailSystem}
            disabled={updating}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${config.emailEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Trạng thái: <span className={`font-medium ${config.emailEnabled ? 'text-green-600' : 'text-red-600'}`}>
            {config.emailEnabled ? 'Đang hoạt động' : 'Đã tắt'}
          </span>
        </div>
      </div>

      {/* User Email Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email cho Khách hàng</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Email xác nhận đơn hàng</label>
              <p className="text-sm text-gray-500">Gửi email khi khách hàng tạo đơn hàng</p>
            </div>
            <button
              onClick={() => handleUpdateConfig('sendUserOrderConfirmation', !config.sendUserOrderConfirmation)}
              disabled={updating || !config.emailEnabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${config.sendUserOrderConfirmation && config.emailEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.sendUserOrderConfirmation && config.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Email thanh toán thành công</label>
              <p className="text-sm text-gray-500">Gửi email khi khách hàng thanh toán thành công</p>
            </div>
            <button
              onClick={() => handleUpdateConfig('sendUserPaymentSuccess', !config.sendUserPaymentSuccess)}
              disabled={updating || !config.emailEnabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${config.sendUserPaymentSuccess && config.emailEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.sendUserPaymentSuccess && config.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Admin Email Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email cho Admin</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Thông báo đơn hàng mới</label>
              <p className="text-sm text-gray-500">Gửi email khi có đơn hàng mới</p>
            </div>
            <button
              onClick={() => handleUpdateConfig('sendAdminOrderNotification', !config.sendAdminOrderNotification)}
              disabled={updating || !config.emailEnabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${config.sendAdminOrderNotification && config.emailEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.sendAdminOrderNotification && config.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Thông báo thanh toán thành công</label>
              <p className="text-sm text-gray-500">Gửi email khi khách hàng thanh toán thành công</p>
            </div>
            <button
              onClick={() => handleUpdateConfig('sendAdminPaymentSuccess', !config.sendAdminPaymentSuccess)}
              disabled={updating || !config.emailEnabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${config.sendAdminPaymentSuccess && config.emailEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.sendAdminPaymentSuccess && config.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Admin Emails Management */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Danh sách Email Admin</h3>

        {/* Add new admin email */}
        <div className="flex gap-2 mb-4">
          <input
            type="email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            placeholder="Nhập email admin mới"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={updating}
          />
          <button
            onClick={handleAddAdminEmail}
            disabled={updating || !newAdminEmail.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Thêm
          </button>
        </div>

        {/* List of admin emails */}
        <div className="space-y-2">
          {config.adminEmails.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có email admin nào</p>
          ) : (
            config.adminEmails.map((email, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-700">{email}</span>
                <button
                  onClick={() => handleRemoveAdminEmail(email)}
                  disabled={updating}
                  className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Configuration URLs */}
      <div className="bg-white shadow rounded-lg p-6 hidden">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cấu hình URL</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Trang quản trị</label>
            <input
              type="url"
              value={config.adminDashboardUrl}
              onChange={(e) => handleUpdateConfig('adminDashboardUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={updating}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Trang đơn hàng</label>
            <input
              type="url"
              value={config.adminOrdersUrl}
              onChange={(e) => handleUpdateConfig('adminOrdersUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={updating}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Admin mặc định</label>
            <input
              type="email"
              value={config.defaultAdminEmail}
              onChange={(e) => handleUpdateConfig('defaultAdminEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={updating}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfigSettings;