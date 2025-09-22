"use client";

import EmailConfigSettings from './EmailConfigSettings';

const EmailManagement = () => {

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        {/* Tab Content */}
        <div className="p-6">
          <EmailConfigSettings />
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