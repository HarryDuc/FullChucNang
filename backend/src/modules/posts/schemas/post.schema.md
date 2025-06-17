# 🧾 Post Schema – Tài liệu mô tả

## 🧱 Tổng quan

- Tên schema: `Post`
- Tự động gắn timestamp: `createdAt`, `updatedAt` (`@Schema({ timestamps: true })`)
- Dùng cho collection: `posts`
- Soft delete: thông qua trường `isDeleted`

---

## 🧩 Cấu trúc Schema

### 📌 Định danh

| Trường | Kiểu dữ liệu | Bắt buộc | Ghi chú                     |
| ------ | ------------ | -------- | --------------------------- |
| `slug` | `string`     | ✅       | Unique, index, dùng làm URL |

---

### 📝 Nội dung chính

| Trường     | Kiểu dữ liệu | Ghi chú                     |
| ---------- | ------------ | --------------------------- |
| `title`    | `string`     | Tiêu đề                     |
| `excerpt`  | `string`     | Mô tả ngắn                  |
| `postData` | `string`     | Nội dung HTML hoặc Markdown |

---

### 🎥 Media mở rộng

| Trường       | Kiểu dữ liệu |
| ------------ | ------------ |
| `coverVideo` | `string`     |

---

### 🖼️ Hình ảnh

| Trường      | Kiểu dữ liệu |
| ----------- | ------------ |
| `thumbnail` | `string[]`   |
| `images`    | `string[]`   |

---

### 📚 Phân loại & Thẻ

| Trường          | Kiểu dữ liệu | Ghi chú                |
| --------------- | ------------ | ---------------------- |
| `categoryPaths` | `string[]`   | Slug chuyên mục, index |
| `tags`          | `string[]`   | Gắn thẻ nội dung       |

---

### 👤 Tác giả & Kiểm duyệt

| Trường         | Kiểu dữ liệu | Ghi chú         |
| -------------- | ------------ | --------------- |
| `author`       | `string`     | Index           |
| `createdBy`    | `string`     | Người khởi tạo  |
| `updatedBy`    | `string`     | Người chỉnh sửa |
| `approvedBy`   | `string`     | Người duyệt     |
| `approvedDate` | `Date`       | Ngày duyệt      |

---

### ⏳ Thời gian

| Trường          | Kiểu dữ liệu | Ghi chú           |
| --------------- | ------------ | ----------------- |
| `publishedDate` | `Date`       | Ngày xuất bản     |
| `scheduledAt`   | `Date`       | Lên lịch đăng bài |
| `createdAt`     | `Date`       | Ngày tạo          |
| `updatedAt`     | `Date`       | Ngày cập nhật     |

---

### ✅ Trạng thái bài viết

| Trường   | Kiểu dữ liệu | Enum                                       | Mặc định |
| -------- | ------------ | ------------------------------------------ | -------- |
| `status` | `PostStatus` | `draft`, `pending`, `approved`, `rejected` | `draft`  |

---

### 🔍 SEO & Metadata

| Trường | Kiểu dữ liệu | Ghi chú                                                              |
| ------ | ------------ | -------------------------------------------------------------------- |
| `meta` | `PostMeta`   | Subdocument chứa các trường: `likes`, `views`, `shares`, `bookmarks` |

---

### 📌 Hiển thị đặc biệt

| Trường             | Kiểu dữ liệu | Ghi chú                  |
| ------------------ | ------------ | ------------------------ |
| `isFeatured`       | `boolean`    | Bài nổi bật              |
| `isPinned`         | `boolean`    | Bài ghim trang chủ       |
| `relatedPostSlugs` | `string[]`   | Danh sách slug liên quan |

---

### 📊 Thống kê

| Trường           | Kiểu dữ liệu | Ghi chú                        |
| ---------------- | ------------ | ------------------------------ |
| `meta.views`     | `number`     | Số lượt xem (nằm trong `meta`) |
| `meta.likes`     | `number`     | Số lượt thích                  |
| `meta.shares`    | `number`     | Số lượt chia sẻ                |
| `meta.bookmarks` | `number`     | Số lượt lưu                    |

---

### 🔒 Soft Delete

| Trường      | Kiểu dữ liệu | Ghi chú                    |
| ----------- | ------------ | -------------------------- |
| `isDeleted` | `boolean`    | Mặc định `false`, có index |

---

## 🔍 Các chỉ mục (Indexes)

| Mục đích                        | Index                                                                                             |
| ------------------------------- | ------------------------------------------------------------------------------------------------- |
| Tìm kiếm toàn văn               | `{ title: 'text', author: 'text' }`                                                               |
| Lọc theo chuyên mục, trạng thái | `{ categoryPaths: 1, status: 1, publishedDate: -1, isDeleted: 1 }`                                |
| Lọc bài đã duyệt                | `{ status: 1, approvedDate: -1, isDeleted: 1 }`                                                   |
| Bài phổ biến                    | `{ "meta.views": -1, publishedDate: -1 }` _(partial index: status = approved, isDeleted = false)_ |
| Bài của tác giả                 | `{ author: 1, publishedDate: -1, isDeleted: 1 }`                                                  |
| Bài ghim trang chủ              | `{ isPinned: 1, publishedDate: -1 }` _(partial index: isPinned = true, isDeleted = false)_        |
| Bài nổi bật                     | `{ isFeatured: 1, publishedDate: -1 }` _(partial index: isFeatured = true, isDeleted = false)_    |
| Lên lịch bài viết               | `{ scheduledAt: 1, status: 1, isDeleted: 1 }`                                                     |
| Theo ngày tạo                   | `{ createdAt: -1, isDeleted: 1 }`                                                                 |
| Tìm theo tag                    | `{ tags: 1 }` _(index sparse)_                                                                    |
| Lookup an toàn theo slug        | `{ slug: 1, isDeleted: 1 }` _(unique)_                                                            |

---

## 🧠 Ghi chú kỹ thuật

- **Index nào cũng cần tính đến `isDeleted`** để loại trừ dữ liệu đã bị xóa mềm.
- `PostMeta` được thiết kế để mở rộng dễ dàng trong tương lai (thêm reaction, comment count...).
- Có thể kết hợp `.lean()` với `.select()` để tối ưu đọc dữ liệu lớn.
- Enum `PostStatus` cần đồng bộ chặt chẽ với DTO/service để kiểm soát quy trình kiểm duyệt.
- Có thể dùng **partial indexes** để giảm chi phí lưu trữ và tăng hiệu suất.

---

## 📎 Liên hệ

Vui lòng liên hệ **team backend** để được hỗ trợ thêm về:

- Truy vấn nâng cao (aggregation pipelines)
- Phân tích hiệu năng (Mongo Atlas Profiler)
- Thiết kế cache layer hoặc CMS tool liên quan
