# 📂 Mô hình `CategoryPost`

Schema đại diện cho **danh mục bài viết** trong hệ thống CMS, sử dụng **cây phân cấp** dựa trên mô hình **Materialized Path**. Mỗi danh mục có thể chứa nhiều danh mục con, phục vụ quản lý nội dung và hiển thị trên UI hiệu quả.

## 🧹 Cấu trúc dữ liệu

| Trường      | Kiểu dữ liệu       | Mô tả                                                              |
| ----------- | ------------------ | ------------------------------------------------------------------ |
| `name`      | `string`           | Tên danh mục (bắt buộc, tối đa 100 ký tự, đã trim).                |
| `slug`      | `string`           | Định danh URL duy nhất (bắt buộc, đã chuẩn hóa ở service, unique). |
| `level`     | `number`           | Cấp độ phân cấp (root = 0).                                        |
| `parent`    | `ObjectId \| null` | ID danh mục cha (có thể null nếu là danh mục gốc).                 |
| `children`  | `ObjectId[]`       | Danh sách con, không trùng lặp ID.                                 |
| `path`      | `string`           | Đường dẫn đầy đủ (dạng: `/parent/child/...`).                      |
| `sortOrder` | `number`           | **Thứ tự hiển thị**, mặc định `0`. Số nhỏ hơn được hiển thị trước. |
| `isDeleted` | `boolean`          | Đánh dấu soft delete.                                              |
| `createdAt` | `Date`             | Ngày tạo (tự động bởi Mongoose).                                   |
| `updatedAt` | `Date`             | Ngày cập nhật (tự động bởi Mongoose).                              |

## ✅ Ràng buộc & Validation

- `name`: bắt buộc, tối thiểu 1 ký tự, tối đa 100, đã `trim`.
- `slug`: bắt buộc, duy nhất, đã chuẩn hóa phía service.
- `children`: kiểm tra không trùng lặp `ObjectId`.
- `sortOrder`: kiểu `number`, có thể âm/dương.

## 🏷️ Chỉ mục (Indexes)

| Tên chỉ mục                | Trường liên quan                    | Mục đích                                                          |
| -------------------------- | ----------------------------------- | ----------------------------------------------------------------- |
| `idx_slug_isDeleted`       | `{ slug, isDeleted }`               | Truy vấn theo slug không bị xóa.                                  |
| `idx_parent_isDeleted`     | `{ parent, isDeleted }`             | Lấy danh mục con từ cha.                                          |
| `idx_level_isDeleted`      | `{ level, isDeleted }`              | Truy vấn theo cấp độ phân cấp.                                    |
| `idx_name_isDeleted`       | `{ name, isDeleted }`               | Tìm kiếm theo tên.                                                |
| `idx_path_isDeleted`       | `{ path, isDeleted }`               | Truy vấn theo đường dẫn.                                          |
| `idx_createdAt_isDeleted`  | `{ createdAt (desc), isDeleted }`   | Lọc theo ngày tạo, mới nhất trước.                                |
| `idx_path_level_createdAt` | `{ path, level, createdAt (desc) }` | Truy vấn phân cấp kết hợp thời gian, phục vụ phân trang phân cấp. |
| `idx_isDeleted`            | `{ isDeleted }`                     | Truy vấn tất cả danh mục còn hoạt động.                           |
| `idx_sortOrder_isDeleted`  | `{ sortOrder, isDeleted }`          | Sắp xếp hiển thị theo `sortOrder`.                                |

## 💡 Ghi chú triển khai

- **slug** được chuẩn hóa tại service trước khi lưu.
- **path** được cập nhật tự động tại service mỗi khi thay đổi `parent`, nhằm duy trì đúng cấu trúc cây.
- **sortOrder** cho phép admin điều chỉnh trực tiếp vị trí hiển thị trong UI mà không phụ thuộc tên hoặc thời gian tạo.
- **Soft delete** được quản lý bằng trường `isDeleted`, không xóa vật lý khỏi DB.
