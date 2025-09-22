"use client";

import { useState } from 'react';
import { useEmailConfig } from '../hooks/useEmailConfig';

const EmailTest = () => {
  const {
    config,
    updating,
    testEmail,
    sendOrderConfirmationEmail,
    sendPaymentSuccessEmail,
  } = useEmailConfig();

  const [testData, setTestData] = useState({
    orderId: '',
    checkoutId: '',
    emailType: 'confirmation' as 'confirmation' | 'payment-success',
    sendToUser: true,
    sendToAdmin: true,
  });

  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleTestEmail = async () => {
    if (!testData.orderId || !testData.checkoutId) {
      setResult({ success: false, message: 'Vui lòng nhập Order ID và Checkout ID' });
      setShowResult(true);
      return;
    }

    try {
      const response = await testEmail(
        testData.orderId,
        testData.checkoutId,
        testData.emailType,
        testData.sendToUser,
        testData.sendToAdmin
      );
      setResult({ success: true, message: response.message });
      setShowResult(true);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi test email'
      });
      setShowResult(true);
    }
  };

  const handleSendOrderConfirmation = async () => {
    if (!testData.orderId || !testData.checkoutId) {
      setResult({ success: false, message: 'Vui lòng nhập Order ID và Checkout ID' });
      setShowResult(true);
      return;
    }

    try {
      const response = await sendOrderConfirmationEmail(
        testData.orderId,
        testData.checkoutId,
        testData.sendToUser,
        testData.sendToAdmin
      );
      setResult({ success: true, message: response.message });
      setShowResult(true);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi gửi email xác nhận đơn hàng'
      });
      setShowResult(true);
    }
  };

  const handleSendPaymentSuccess = async () => {
    if (!testData.orderId || !testData.checkoutId) {
      setResult({ success: false, message: 'Vui lòng nhập Order ID và Checkout ID' });
      setShowResult(true);
      return;
    }

    try {
      const response = await sendPaymentSuccessEmail(
        testData.orderId,
        testData.checkoutId,
        testData.sendToUser,
        testData.sendToAdmin
      );
      setResult({ success: true, message: response.message });
      setShowResult(true);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi gửi email thanh toán thành công'
      });
      setShowResult(true);
    }
  };

  const clearResult = () => {
    setShowResult(false);
    setResult(null);
  };

  if (!config) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="text-sm text-yellow-700">Vui lòng tải cấu hình email trước khi test</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Test Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Test Gửi Email</h3>

        <div className="space-y-4">
          {/* Order ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
            <input
              type="text"
              value={testData.orderId}
              onChange={(e) => setTestData({ ...testData, orderId: e.target.value })}
              placeholder="Nhập Order ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={updating}
            />
          </div>

          {/* Checkout ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Checkout ID</label>
            <input
              type="text"
              value={testData.checkoutId}
              onChange={(e) => setTestData({ ...testData, checkoutId: e.target.value })}
              placeholder="Nhập Checkout ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={updating}
            />
          </div>

          {/* Email Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại Email</label>
            <select
              value={testData.emailType}
              onChange={(e) => setTestData({ ...testData, emailType: e.target.value as 'confirmation' | 'payment-success' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={updating}
            >
              <option value="confirmation">Xác nhận đơn hàng</option>
              <option value="payment-success">Thanh toán thành công</option>
            </select>
          </div>

          {/* Send Options */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tùy chọn gửi</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={testData.sendToUser}
                  onChange={(e) => setTestData({ ...testData, sendToUser: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  disabled={updating}
                />
                <span className="ml-2 text-sm text-gray-700">Gửi cho User</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={testData.sendToAdmin}
                  onChange={(e) => setTestData({ ...testData, sendToAdmin: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  disabled={updating}
                />
                <span className="ml-2 text-sm text-gray-700">Gửi cho Admin</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleTestEmail}
              disabled={updating || !testData.orderId || !testData.checkoutId}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? 'Đang test...' : 'Test Email'}
            </button>

            <button
              onClick={handleSendOrderConfirmation}
              disabled={updating || !testData.orderId || !testData.checkoutId}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Gửi Email Xác nhận
            </button>

            <button
              onClick={handleSendPaymentSuccess}
              disabled={updating || !testData.orderId || !testData.checkoutId}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Gửi Email Thanh toán
            </button>
          </div>
        </div>
      </div>

      {/* Result */}
      {showResult && result && (
        <div className={`border rounded-lg p-4 ${result.success
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
          }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {result.success ? (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                {result.success ? 'Thành công' : 'Lỗi'}
              </h3>
              <div className={`mt-2 text-sm ${result.success ? 'text-green-700' : 'text-red-700'
                }`}>
                {result.message}
              </div>
            </div>
            <div className="ml-3">
              <button
                onClick={clearResult}
                className={`text-sm font-medium ${result.success ? 'text-green-800 hover:text-green-600' : 'text-red-800 hover:text-red-600'
                  }`}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current Configuration Status */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Trạng thái Cấu hình Hiện tại</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Hệ thống Email:</span>
              <span className={`text-sm font-medium ${config.emailEnabled ? 'text-green-600' : 'text-red-600'}`}>
                {config.emailEnabled ? 'Đang hoạt động' : 'Đã tắt'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email User - Xác nhận:</span>
              <span className={`text-sm font-medium ${config.sendUserOrderConfirmation ? 'text-green-600' : 'text-red-600'}`}>
                {config.sendUserOrderConfirmation ? 'Bật' : 'Tắt'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email User - Thanh toán:</span>
              <span className={`text-sm font-medium ${config.sendUserPaymentSuccess ? 'text-green-600' : 'text-red-600'}`}>
                {config.sendUserPaymentSuccess ? 'Bật' : 'Tắt'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email Admin - Đơn hàng mới:</span>
              <span className={`text-sm font-medium ${config.sendAdminOrderNotification ? 'text-green-600' : 'text-red-600'}`}>
                {config.sendAdminOrderNotification ? 'Bật' : 'Tắt'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email Admin - Thanh toán:</span>
              <span className={`text-sm font-medium ${config.sendAdminPaymentSuccess ? 'text-green-600' : 'text-red-600'}`}>
                {config.sendAdminPaymentSuccess ? 'Bật' : 'Tắt'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Số email admin:</span>
              <span className="text-sm font-medium text-gray-900">{config.adminEmails.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTest;