
# 🗂️ PostRepository Documentation

## 🔍 Tổng quan

`PostRepository` là lớp truy cập cơ sở dữ liệu (DAO) cho module bài viết. Thực hiện các thao tác trực tiếp với MongoDB qua Mongoose Model, bao gồm tạo, tìm kiếm, cập nhật và xóa bài viết.

---

## 📌 Các phương thức

### ➕ `create(dto: CreatePostDto)`

**Chức năng:**  
Tạo một bài viết mới từ DTO.

**Tham số:**  
- `dto`: Dữ liệu bài viết từ client (`CreatePostDto`)

**Trả về:**  
Đối tượng bài viết vừa được tạo.

---

### 📄 `findAll()`

**Chức năng:**  
Trả về danh sách tất cả bài viết chưa bị xóa mềm (`isDeleted = false`), sắp xếp theo `createdAt` giảm dần.

**Trả về:**  
Danh sách bài viết (`lean()` object).

---

### 🔍 `findBySlug(slug: string)`

**Chức năng:**  
Tìm bài viết theo slug và chưa bị xóa.

**Tham số:**  
- `slug`: Slug bài viết cần tìm

**Trả về:**  
Bài viết nếu tìm thấy, ngược lại trả về `null`.

---

### ✏️ `updateBySlug(slug: string, dto: UpdatePostDto)`

**Chức năng:**  
Cập nhật nội dung bài viết dựa theo slug. Đồng thời cập nhật `updatedAt` về thời điểm hiện tại.

**Tham số:**  
- `slug`: Slug bài viết gốc
- `dto`: Dữ liệu cần cập nhật (`UpdatePostDto`)

**Trả về:**  
Bài viết sau khi cập nhật.

---

### 🗑️ `softDelete(slug: string)`

**Chức năng:**  
Thực hiện xóa mềm bài viết bằng cách gán `isDeleted = true`.

**Tham số:**  
- `slug`: Slug bài viết cần xóa

**Trả về:**  
Bài viết sau khi được đánh dấu xóa mềm.

---

### ❌ `hardDelete(slug: string)`

**Chức năng:**  
Xóa vĩnh viễn bài viết khỏi cơ sở dữ liệu.

**Tham số:**  
- `slug`: Slug bài viết cần xóa

**Trả về:**  
Bài viết đã bị xóa vĩnh viễn.

---

### ✅ `existsBySlug(slug: string): Promise<boolean>`

**Chức năng:**  
Kiểm tra xem một slug đã tồn tại trong hệ thống hay chưa (chỉ kiểm tra bài viết chưa bị xóa mềm).

**Trả về:**  
`true` nếu slug đã tồn tại, `false` nếu chưa.

---

## 🧠 Ghi chú kỹ thuật

- Mọi truy vấn đều áp dụng điều kiện `isDeleted: false` để loại trừ các bài viết đã bị xóa mềm.
- Các thao tác sử dụng `lean()` để tối ưu hiệu suất khi không cần phương thức instance.
- `updatedAt` được cập nhật thủ công trong cập nhật bài viết.
