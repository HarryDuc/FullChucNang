# 📘 CategoryPostController Documentation

## 🔹 Tổng quan

`CategoryPostController` chịu trách nhiệm xử lý toàn bộ các thao tác CRUD cho **danh mục bài viết** trong hệ thống CMS.  
Toàn bộ API đều sử dụng `slug` để định danh – chuẩn SEO, thân thiện người dùng, dễ phân cấp và chia sẻ.

---

## 📌 Danh sách endpoint

| Method   | Endpoint                                | Mô tả chức năng                               |
| -------- | --------------------------------------- | --------------------------------------------- |
| `POST`   | `/api/category-posts`                   | Tạo danh mục mới                              |
| `PATCH`  | `/api/category-posts/:slug`             | Cập nhật thông tin danh mục                   |
| `GET`    | `/api/category-posts/:slug`             | Trả về cây danh mục theo `slug`               |
| `GET`    | `/api/category-posts`                   | Lấy danh mục phân trang (không đệ quy)        |
| `PATCH`  | `/api/category-posts/:slug/soft-delete` | Đánh dấu danh mục đã xóa (`isDeleted = true`) |
| `DELETE` | `/api/category-posts/:slug`             | Xóa vĩnh viễn danh mục                        |

---

## 📂 Chi tiết từng phương thức

### 🔹 `POST /api/category-posts`

**Chức năng:**  
Tạo mới một danh mục bài viết.

- Nếu có `parent` → hệ thống tự động tính `path` và `level`.
- Nếu không truyền `slug` → hệ thống tự sinh từ `name`, đảm bảo duy nhất bằng hậu tố `-1`, `-2`,...

**Body:** `CreateCategoryPostDto`  
**Trả về:** `{ message, data }` – Thông báo và thông tin danh mục đã tạo.

---

### 🔹 `PATCH /api/category-posts/:slug`

**Chức năng:**  
Cập nhật danh mục theo `slug`.

- Cho phép cập nhật các trường: `name`, `slug`, `parent`, `children`, `sortOrder`...
- Tự động cập nhật `path` và `level` nếu thay đổi `parent`.
- Kiểm tra các lỗi logic sau:
  - Không cho danh mục làm cha của chính nó.
  - Không cho chọn danh mục con làm cha → tránh vòng lặp đệ quy.

**Body:** `UpdateCategoryPostDto`  
**Trả về:** `{ message, data }` – Danh mục đã cập nhật.

---

### 🔹 `GET /api/category-posts/:slug`

**Chức năng:**  
Lấy thông tin một danh mục và toàn bộ cây con của nó (đệ quy).

**Trả về:** `{ message, data }` – Dạng `CategoryPostTree`.

---

### 🔹 `GET /api/category-posts?page=&limit=`

**Chức năng:**  
Lấy tất cả danh mục chưa xóa (`isDeleted = false`) theo phân trang, không đệ quy.

**Query Params:**

| Param   | Mô tả                | Mặc định |
| ------- | -------------------- | -------- |
| `page`  | Trang hiện tại       | `1`      |
| `limit` | Số bản ghi mỗi trang | `10`     |

**Trả về:** `{ message, data }` – Danh sách danh mục.

---

### 🔹 `PATCH /api/category-posts/:slug/soft-delete`

**Chức năng:**  
Xóa mềm danh mục bằng cách đặt `isDeleted = true`.

**Trả về:** `{ message }` – Thông báo xóa mềm thành công.

---

### 🔹 `DELETE /api/category-posts/:slug`

**Chức năng:**  
Xóa vĩnh viễn danh mục khỏi cơ sở dữ liệu.

**Trả về:** `{ message }` – Thông báo xóa vĩnh viễn thành công.

---

## 🧠 Kỹ thuật & bảo mật

- **Slug chuẩn SEO:** Tự động loại bỏ dấu tiếng Việt, ký tự đặc biệt, viết thường.
- **Phân cấp cây:** Áp dụng mô hình `Materialized Path`, xử lý tốt đệ quy và truy vấn nhanh.
- **Không cho phép trùng `slug`:** Kiểm tra cả khi tạo mới và cập nhật.
- **Ngăn vòng lặp phân cấp:** Không cho danh mục trở thành cha của chính mình hoặc tổ tiên của mình.
- **Xử lý lỗi chuẩn REST:**
  - `404 Not Found`: Không tìm thấy danh mục.
  - `409 Conflict`: Trùng slug, hoặc phân cấp không hợp lệ.
  - `400 Bad Request`: Dữ liệu đầu vào không hợp lệ.
