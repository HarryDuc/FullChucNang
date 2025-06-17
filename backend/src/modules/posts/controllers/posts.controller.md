# 📘 PostController Documentation

## 🔹 Tổng quan

`PostController` là bộ điều khiển chịu trách nhiệm xử lý toàn bộ các thao tác CRUD cho bài viết trong hệ thống. Controller này sử dụng `slug` thay cho `id`, đảm bảo tính thân thiện SEO, dễ đọc, dễ thao tác và dễ chia sẻ.

---

## 📌 Endpoint và chức năng

| Phương thức | Đường dẫn                | Chức năng                            |
| ----------- | ------------------------ | ------------------------------------ |
| `POST`      | `/api/posts`             | Tạo bài viết mới                     |
| `GET`       | `/api/posts`             | Lấy danh sách bài viết               |
| `GET`       | `/api/posts/:slug`       | Lấy chi tiết bài viết theo slug      |
| `PATCH`     | `/api/posts/:slug`       | Cập nhật nội dung bài viết           |
| `DELETE`    | `/api/posts/:slug`       | Xóa mềm bài viết (soft delete)       |
| `DELETE`    | `/api/posts/:slug/force` | Xóa vĩnh viễn bài viết (hard delete) |

---

## 📂 Chi tiết các phương thức

### 🔹 POST `/api/posts`

**Chức năng:**  
Tạo mới một bài viết. Nếu không cung cấp `slug`, hệ thống sẽ tự sinh từ `title`, loại bỏ dấu và ký tự đặc biệt. Trong trường hợp trùng slug, hậu tố `-1`, `-2`,... sẽ được thêm vào để đảm bảo duy nhất.

**Body:** `CreatePostDto`  
**Trả về:** Đối tượng bài viết vừa được tạo.

---

### 🔹 GET `/api/posts`

**Chức năng:**  
Trả về toàn bộ bài viết có `isDeleted = false`, được sắp xếp giảm dần theo thời gian tạo (`createdAt`).

**Trả về:** Mảng các bài viết hợp lệ.

---

### 🔹 GET `/api/posts/:slug`

**Chức năng:**  
Tìm và trả về thông tin chi tiết của một bài viết dựa trên `slug`. Nếu không tìm thấy, trả về lỗi `404 Not Found`.

**Trả về:** Đối tượng bài viết.

---

### 🔹 PATCH `/api/posts/:slug`

**Chức năng:**  
Cập nhật thông tin bài viết dựa theo `slug`. Nếu có cung cấp `slug` mới trong payload:

- Hệ thống sẽ chuẩn hóa lại slug mới.
- Kiểm tra trùng lặp.
- Nếu trùng với bài viết khác → trả về `400 Bad Request`.

**Body:** `UpdatePostDto`  
**Trả về:** Bài viết sau khi cập nhật thành công.

---

### 🔹 DELETE `/api/posts/:slug`

**Chức năng:**  
Thực hiện **soft delete** – đánh dấu bài viết đã bị xóa bằng cách cập nhật trường `isDeleted = true`. Dữ liệu vẫn còn trong DB để có thể khôi phục hoặc kiểm tra sau này.

**Trả về:** Bài viết sau khi được đánh dấu xóa.

---

### 🔹 DELETE `/api/posts/:slug/force`

**Chức năng:**  
**Hard delete** – xóa vĩnh viễn bài viết khỏi cơ sở dữ liệu. Không thể khôi phục sau khi thực hiện.

**Trả về:** Bài viết đã được xóa khỏi DB.

---

## 🧠 Ghi chú kỹ thuật

- **Chuẩn hóa slug:** Sử dụng hàm `removeVietnameseTones()` để loại bỏ dấu tiếng Việt, ký tự đặc biệt và chuyển về chữ thường (lowercase).
- **Xử lý slug trùng khi tạo:** Hệ thống tự động gán hậu tố `-1`, `-2`, v.v... cho đến khi tìm được slug không trùng.
- **Xử lý slug khi cập nhật:** Nếu có yêu cầu thay đổi `slug`, phải đảm bảo không trùng với slug của bài viết khác. Không tự động thay thế slug nếu không có chỉ định.

---

> 💡 **Mở rộng trong tương lai:**  
> Có thể bổ sung phân trang, tìm kiếm theo từ khóa, bộ lọc theo tag/category/trạng thái duyệt bài để phục vụ nhu cầu quản trị nâng cao.
