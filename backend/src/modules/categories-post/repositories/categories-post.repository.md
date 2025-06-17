# 📘 CategoryPostRepository Documentation

## 🔍 Tổng quan

`CategoryPostRepository` là lớp truy cập dữ liệu (DAO) cho **danh mục bài viết**, quản lý phân cấp theo mô hình **materialized path**.  
Tầng này trực tiếp làm việc với MongoDB thông qua `Mongoose Model`, đóng vai trò:

- Tạo, cập nhật, xóa danh mục
- Truy vấn theo `slug`, `parent`, `phân trang`
- Cập nhật danh mục cha/con với đảm bảo tính toàn vẹn

---

## 📌 Các phương thức

### ➕ `create(data: Partial<CategoryPostDocument>)`

**Chức năng:**  
Tạo mới một danh mục bài viết.

**Tham số:**

- `data`: Dữ liệu danh mục đã chuẩn hóa

**Trả về:**  
`CategoryPostDocument` vừa được tạo.

---

### 🔍 `findBySlug(slug: string)`

**Chức năng:**  
Tìm danh mục bài viết chưa bị xóa (`isDeleted = false`) theo `slug`.

**Trả về:**  
Đối tượng danh mục hoặc `null`.

---

### ✏️ `updateBySlug(slug: string, data: Partial<CategoryPost>)`

**Chức năng:**  
Cập nhật danh mục bài viết theo `slug`.

**Trả về:**  
Đối tượng danh mục sau khi cập nhật, hoặc `null` nếu không tìm thấy.

---

### 🗑️ `softDeleteBySlug(slug: string)`

**Chức năng:**  
Thực hiện **xóa mềm** – cập nhật `isDeleted = true`.

**Trả về:**  
Danh mục sau khi xóa mềm hoặc `null`.

---

### ❌ `hardDeleteBySlug(slug: string)`

**Chức năng:**  
Xóa vĩnh viễn danh mục khỏi MongoDB.

**Trả về:**  
Danh mục đã bị xóa hoặc `null`.

---

### ✅ `existsSlug(slug: string): Promise<boolean>`

**Chức năng:**  
Kiểm tra `slug` đã tồn tại hay chưa (chỉ xét danh mục chưa xóa).

**Trả về:**  
`true` nếu tồn tại, `false` nếu không.

---

### 📌 `findById(id: string)`

**Chức năng:**  
Tìm danh mục theo `_id` (được sử dụng nội bộ – ví dụ khi build tree).

**Trả về:**  
`CategoryPost` hoặc `null`.

---

### 📚 `findAll(skip: number, limit: number)`

**Chức năng:**  
Lấy toàn bộ danh mục chưa bị xóa, phân trang theo `skip` & `limit`.  
Sắp xếp theo `sortOrder ASC`, `createdAt DESC`.

**Trả về:**  
Mảng danh mục.

---

### 🌳 `findByParent(parentId: string)`

**Chức năng:**  
Lấy danh sách danh mục con của một `parent`.

**Trả về:**  
Mảng danh mục có `parent = parentId`.

---

### 🔗 `addChildToParent(parentId: string, childId: ObjectId)`

**Chức năng:**  
Cập nhật danh mục cha, **thêm `childId` vào mảng `children`** bằng `$addToSet` (đảm bảo không trùng).

**Trả về:**  
Danh mục cha sau khi được cập nhật.

---

## 🧠 Ghi chú kỹ thuật

- Toàn bộ truy vấn có điều kiện `isDeleted: false` để loại bỏ danh mục đã xóa mềm.
- Không sử dụng `lean()` để giữ nguyên phương thức Mongoose Document khi cần `.toObject()` (dùng trong build tree).
- `$addToSet` đảm bảo tính duy nhất trong mảng `children`.
- Truy vấn và cập nhật đều có `index` để tối ưu hiệu suất (cĐã định nghĩa trong schema).
