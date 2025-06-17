
# 🧩 PostService Documentation

## 🔹 Tổng quan

`PostService` là tầng trung gian giữa `PostController` và `PostRepository`. Nhiệm vụ chính là xử lý nghiệp vụ (business logic) cho các thao tác liên quan đến bài viết như: tạo, tìm kiếm, cập nhật, xóa mềm và xóa vĩnh viễn.

---

## 🔧 Các chức năng chính

| Phương thức          | Mô tả ngắn                                                               |
| -------------------- | ------------------------------------------------------------------------ |
| `create(dto)`        | Tạo bài viết mới, sinh slug không dấu, xử lý trùng lặp                  |
| `findAll()`          | Lấy toàn bộ bài viết chưa bị xóa mềm                                    |
| `findBySlug(slug)`   | Tìm bài viết theo `slug`                                                 |
| `updateBySlug()`     | Cập nhật bài viết, kiểm tra và xử lý khi thay đổi `slug`                |
| `softDelete(slug)`   | Xóa mềm bài viết (đặt `isDeleted = true`)                               |
| `hardDelete(slug)`   | Xóa cứng bài viết khỏi database                                          |

---

## 📂 Chi tiết từng phương thức

### 🟦 `create(dto: CreatePostDto)`

**Chức năng:**  
Tạo bài viết mới. Nếu không cung cấp `slug`, hệ thống sẽ sinh tự động từ `title`. Slug được chuẩn hóa bằng `removeVietnameseTones()` và kiểm tra trùng lặp. Nếu trùng, hệ thống sẽ thêm hậu tố `-1`, `-2`,... để đảm bảo duy nhất.

**Logic xử lý slug:**
```ts
let finalSlug = baseSlug;
let count = 1;
while (await this.postRepo.existsBySlug(finalSlug)) {
  finalSlug = `${baseSlug}-${count++}`;
}
```

**Trả về:** Bài viết đã được tạo.

---

### 🟦 `findAll()`

**Chức năng:**  
Lấy tất cả các bài viết chưa bị xóa mềm (`isDeleted = false`). Không phân trang tại đây – nếu cần, nên tích hợp tại controller hoặc repository.

**Trả về:** Mảng các bài viết.

---

### 🟦 `findBySlug(slug: string)`

**Chức năng:**  
Tìm bài viết theo slug, chỉ lấy bài viết chưa bị xóa mềm.

**Trả về:** Đối tượng bài viết hoặc `null`.

---

### 🟦 `updateBySlug(slug: string, dto: UpdatePostDto)`

**Chức năng:**  
Cập nhật nội dung bài viết. Nếu người dùng thay đổi `slug`, hệ thống sẽ:
- Chuẩn hóa lại slug mới.
- So sánh với slug hiện tại.
- Kiểm tra xem slug mới có bị trùng không.
- Nếu không trùng → cập nhật slug mới.

**Xử lý lỗi:**  
Nếu slug mới đã tồn tại trong hệ thống, ném lỗi `BadRequestException`.

---

### 🟦 `softDelete(slug: string)`

**Chức năng:**  
Xóa mềm bài viết – không xóa khỏi DB, chỉ gán `isDeleted = true`. Cho phép truy vết và phục hồi nếu cần.

**Trả về:** Bài viết sau khi cập nhật trạng thái.

---

### 🟦 `hardDelete(slug: string)`

**Chức năng:**  
Xóa vĩnh viễn bài viết khỏi cơ sở dữ liệu.

**Trả về:** Bài viết vừa bị xóa hoặc `null` nếu không tìm thấy.

---

## 🧠 Ghi chú kỹ thuật

- **Slug chuẩn hóa:**  
  Dùng `removeVietnameseTones()` để loại bỏ dấu tiếng Việt, chuyển sang chữ thường và loại bỏ ký tự đặc biệt.

- **Kiểm tra slug duy nhất:**  
  Đảm bảo tính duy nhất của slug ngay tại tầng service thay vì chỉ rely vào DB index.

- **Không phụ thuộc vào ID:**  
  Mọi thao tác đều dựa trên `slug` để tăng tính SEO, dễ thao tác cho phía frontend.

---

> 📌 **Khuyến nghị mở rộng:**  
> Tích hợp thêm xử lý phân trang, bộ lọc nâng cao (tags, categories, trạng thái) tại `findAll()` hoặc tách sang `searchPosts()`.
