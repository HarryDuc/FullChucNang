# 📧 Email Management Frontend

## Tổng quan

Module quản lý email cho admin frontend với đầy đủ tính năng:
- ✅ Cấu hình email linh hoạt (bật/tắt từng loại)
- ✅ Quản lý danh sách email admin
- ✅ Test gửi email trực tiếp
- ✅ Gửi email thủ công cho đơn hàng
- ✅ Giao diện thân thiện và responsive

## 🏗️ Cấu trúc

```
admin/orders/
├── components/
│   ├── EmailManagement.tsx          # Component chính quản lý email
│   ├── EmailConfigSettings.tsx      # Cấu hình email settings
│   ├── EmailTest.tsx                # Test gửi email
│   ├── OrderEmailStatus.tsx         # Trạng thái email cho từng đơn hàng
│   └── ListOrders.tsx               # Danh sách đơn hàng (đã tích hợp)
├── services/
│   └── email-config.service.ts      # Service gọi API email
├── hooks/
│   └── useEmailConfig.ts            # Hook quản lý state email
├── pages/
│   └── EmailManagementPage.tsx      # Trang riêng cho email management
└── README-EMAIL-FRONTEND.md         # Tài liệu này
```

## 🚀 Cách sử dụng

### 1. Truy cập Email Management

Từ trang danh sách đơn hàng (`/admin/orders`):
- Click button **"Quản lý Email"** ở góc phải trên
- Hoặc truy cập trực tiếp `/admin/orders/email`

### 2. Cấu hình Email

#### Master Switch
- **Hệ thống Email**: Bật/tắt toàn bộ hệ thống gửi email
- Khi tắt, tất cả email sẽ không được gửi

#### Email cho Khách hàng
- **Email xác nhận đơn hàng**: Gửi khi khách hàng tạo đơn hàng
- **Email thanh toán thành công**: Gửi khi khách hàng thanh toán thành công

#### Email cho Admin
- **Thông báo đơn hàng mới**: Gửi khi có đơn hàng mới
- **Thông báo thanh toán thành công**: Gửi khi khách hàng thanh toán thành công

#### Quản lý Email Admin
- **Thêm email admin**: Nhập email và click "Thêm"
- **Xóa email admin**: Click icon xóa bên cạnh email
- **Email mặc định**: Email fallback khi không có email admin nào

#### Cấu hình URL
- **URL Trang quản trị**: Link đến dashboard admin
- **URL Trang đơn hàng**: Link đến trang quản lý đơn hàng
- **Email Admin mặc định**: Email admin chính

### 3. Test Email

#### Test Form
- **Order ID**: ID của đơn hàng cần test
- **Checkout ID**: ID của checkout tương ứng
- **Loại Email**: Chọn "Xác nhận đơn hàng" hoặc "Thanh toán thành công"
- **Tùy chọn gửi**: Chọn gửi cho User và/hoặc Admin

#### Test Actions
- **Test Email**: Test gửi email với cấu hình hiện tại
- **Gửi Email Xác nhận**: Gửi email xác nhận đơn hàng thực tế
- **Gửi Email Thanh toán**: Gửi email thanh toán thành công thực tế

### 4. Gửi Email cho Đơn hàng Cụ thể

Trong danh sách đơn hàng, mỗi đơn hàng có:
- **📧 XN**: Gửi email xác nhận đơn hàng
- **💰 TT**: Gửi email thanh toán thành công

## 🎨 Giao diện

### Email Management Dashboard
- **Header**: Tiêu đề và thông tin hệ thống
- **Tabs**: Chuyển đổi giữa "Cấu hình Email" và "Test Email"
- **Quick Actions**: Các hành động nhanh
- **Information Panel**: Thông tin về tính năng

### Email Config Settings
- **Master Switch**: Toggle bật/tắt toàn bộ hệ thống
- **User Email Settings**: Cấu hình email cho khách hàng
- **Admin Email Settings**: Cấu hình email cho admin
- **Admin Emails Management**: Quản lý danh sách email admin
- **Configuration URLs**: Cấu hình các URL liên quan

### Email Test
- **Test Form**: Form nhập thông tin test
- **Action Buttons**: Các button test và gửi email
- **Result Display**: Hiển thị kết quả test
- **Current Status**: Trạng thái cấu hình hiện tại

## 🔧 API Integration

### Service Methods
```typescript
// Lấy cấu hình email
EmailConfigService.getEmailConfiguration()

// Cập nhật cấu hình
EmailConfigService.updateEmailConfiguration(config)

// Bật/tắt hệ thống email
EmailConfigService.toggleEmailSystem(enabled)

// Bật/tắt email user
EmailConfigService.toggleUserEmails(orderConfirmation, paymentSuccess)

// Bật/tắt email admin
EmailConfigService.toggleAdminEmails(orderNotification, paymentSuccess)

// Thêm/xóa email admin
EmailConfigService.addAdminEmail(email)
EmailConfigService.removeAdminEmail(email)

// Test và gửi email
EmailConfigService.testEmail(request)
EmailConfigService.sendOrderConfirmationEmail(request)
EmailConfigService.sendPaymentSuccessEmail(request)
```

### Hook Usage
```typescript
const {
  config,           // Cấu hình email hiện tại
  loading,          // Trạng thái loading
  error,            // Lỗi nếu có
  updating,         // Trạng thái updating
  updateConfig,     // Cập nhật cấu hình
  toggleEmailSystem, // Bật/tắt hệ thống
  toggleUserEmails,  // Bật/tắt email user
  toggleAdminEmails, // Bật/tắt email admin
  addAdminEmail,     // Thêm email admin
  removeAdminEmail,  // Xóa email admin
  testEmail,         // Test email
  sendOrderConfirmationEmail, // Gửi email xác nhận
  sendPaymentSuccessEmail,    // Gửi email thanh toán
} = useEmailConfig();
```

## 🎯 Tính năng chính

### 1. Cấu hình Linh hoạt
- ✅ Bật/tắt từng loại email riêng biệt
- ✅ Master switch để tắt toàn bộ hệ thống
- ✅ Quản lý danh sách email admin
- ✅ Cấu hình URL và thông tin liên quan

### 2. Test và Debug
- ✅ Test gửi email với dữ liệu thực
- ✅ Kiểm tra cấu hình trước khi sử dụng
- ✅ Hiển thị kết quả test chi tiết
- ✅ Gửi email thủ công cho đơn hàng cụ thể

### 3. Giao diện Thân thiện
- ✅ Design responsive, tương thích mobile
- ✅ Toggle switches dễ sử dụng
- ✅ Thông báo thành công/lỗi rõ ràng
- ✅ Loading states và disabled states

### 4. Tích hợp Seamless
- ✅ Tích hợp vào trang admin orders hiện tại
- ✅ Không ảnh hưởng đến chức năng cũ
- ✅ Có thể truy cập từ nhiều nơi
- ✅ State management tốt

## 🔒 Bảo mật

- ✅ Tất cả API calls đều có JWT authentication
- ✅ Token được lưu trong localStorage
- ✅ Validation input phía client
- ✅ Error handling đầy đủ

## 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Tương thích với mọi kích thước màn hình
- ✅ Touch-friendly buttons
- ✅ Readable text trên mobile

## 🐛 Troubleshooting

### Email không được gửi
1. Kiểm tra **Master Switch** có bật không
2. Kiểm tra cấu hình SMTP ở backend
3. Kiểm tra logs trong browser console
4. Kiểm tra network requests trong DevTools

### Cấu hình không lưu
1. Kiểm tra JWT token có hợp lệ không
2. Kiểm tra API response trong DevTools
3. Kiểm tra validation errors
4. Refresh trang và thử lại

### Test email thất bại
1. Kiểm tra Order ID và Checkout ID có đúng không
2. Kiểm tra đơn hàng có tồn tại không
3. Kiểm tra cấu hình email có đúng không
4. Kiểm tra logs backend

## 🚀 Deployment

### Environment Variables
```env
# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_ADMIN_DASHBOARD_URL=http://localhost:3000/admin
NEXT_PUBLIC_ADMIN_ORDERS_URL=http://localhost:3000/admin/orders
```

### Build và Deploy
```bash
# Build frontend
npm run build

# Deploy
npm run deploy
```

## 📈 Performance

- ✅ Lazy loading components
- ✅ Optimized API calls
- ✅ Caching configuration
- ✅ Minimal re-renders
- ✅ Efficient state management

## 🔄 Updates và Maintenance

### Thêm tính năng mới
1. Tạo component mới trong `components/`
2. Thêm service method trong `email-config.service.ts`
3. Cập nhật hook `useEmailConfig.ts`
4. Tích hợp vào `EmailManagement.tsx`

### Cập nhật UI
1. Chỉnh sửa Tailwind classes
2. Test responsive design
3. Kiểm tra accessibility
4. Update documentation

---

## 🎉 Kết luận

Module Email Management Frontend cung cấp:
- ✅ **Giao diện hoàn chỉnh** để quản lý email
- ✅ **Tích hợp seamless** với hệ thống hiện tại
- ✅ **Tính năng đầy đủ** cho admin quản lý email
- ✅ **User experience tốt** với responsive design
- ✅ **Dễ bảo trì và mở rộng**

Admin giờ đây có thể dễ dàng quản lý toàn bộ hệ thống email từ giao diện web! 🚀