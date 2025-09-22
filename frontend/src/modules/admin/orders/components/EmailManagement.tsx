"use client";

import { useState } from 'react';
import EmailConfigSettings from './EmailConfigSettings';
import EmailTest from './EmailTest';

const EmailManagement = () => {
  const [activeTab, setActiveTab] = useState<'settings' | 'test'>('settings');

  const tabs = [
    { id: 'settings', name: 'Cấu hình Email', icon: '⚙️' },
    { id: 'test', name: 'Test Email', icon: '🧪' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Email Đơn hàng</h1>
            <p className="text-sm text-gray-600 mt-1">
              Cấu hình và quản lý hệ thống gửi email cho đơn hàng và thanh toán
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">📧</span>
            <span className="text-sm font-medium text-gray-700">Email System</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'settings' | 'test')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'settings' && <EmailConfigSettings />}
          {activeTab === 'test' && <EmailTest />}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hành động nhanh</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-900">Cấu hình Email</h4>
                <p className="text-sm text-blue-700">Thiết lập và quản lý cấu hình email</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="mt-3 w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Mở Cấu hình
            </button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-green-900">Test Email</h4>
                <p className="text-sm text-green-700">Kiểm tra và test gửi email</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('test')}
              className="mt-3 w-full px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Test Email
            </button>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-purple-900">Hướng dẫn</h4>
                <p className="text-sm text-purple-700">Tài liệu và hướng dẫn sử dụng</p>
              </div>
            </div>
            <button
              onClick={() => {
                // Có thể mở modal hướng dẫn hoặc chuyển đến trang documentation
                alert('Tính năng hướng dẫn sẽ được thêm vào sau');
              }}
              className="mt-3 w-full px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Xem Hướng dẫn
            </button>
          </div>
        </div>
      </div>

      {/* Information Panel */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin Hệ thống Email</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Tính năng chính:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Gửi email xác nhận đơn hàng cho khách hàng</li>
              <li>• Gửi email thông báo thanh toán thành công</li>
              <li>• Thông báo đơn hàng mới cho admin</li>
              <li>• Thông báo thanh toán thành công cho admin</li>
              <li>• Cấu hình bật/tắt linh hoạt</li>
              <li>• Quản lý danh sách email admin</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Lưu ý:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Email được gửi tự động khi có đơn hàng mới</li>
              <li>• Email được gửi khi thanh toán thành công</li>
              <li>• Có thể tắt từng loại email riêng biệt</li>
              <li>• Master switch để tắt toàn bộ hệ thống</li>
              <li>• Test email để kiểm tra trước khi sử dụng</li>
              <li>• Cấu hình được lưu tự động</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailManagement;