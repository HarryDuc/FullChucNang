# 🤩 CategoryPostService Documentation

## 🔹 Tổng quan

`CategoryPostService` là lớp xử lý **nghiệp vụ (business logic)** cho module **Danh mục bài viết**.  
Tầng service đứng giữa controller và repository, đảm nhận việc chuẩn hóa dữ liệu, xử lý phân cấp, kiểm tra slug trùng lặp, và xây dựng cây danh mục đệ quy.

---

## 📋 Chức năng chính

| Phương thức            | Mô tả                                                               |
| ---------------------- | ------------------------------------------------------------------- |
| `create(dto)`          | Tạo danh mục mới, sinh slug, xác định path + level, cập nhật parent |
| `update(slug, dto)`    | Cập nhật danh mục – hỗ trợ đổi slug, cập nhật path/level            |
| `findOne(slug)`        | Lấy thông tin chi tiết + toàn bộ cây danh mục con (đệ quy)          |
| `findAll(page, limit)` | Truy vấn danh mục có phân trang, hỗ trợ quản trị UI                 |
| `softDelete(slug)`     | Xóa mềm – chỉ đặt `isDeleted = true`, không xóa khỏi DB             |
| `hardDelete(slug)`     | Xóa vĩnh viễn khỏi cơ sở dữ liệu MongoDB                            |

---

## 📜 Chi tiết từng phương thức

### ✅ `create(dto: CreateCategoryPostDto)`

**Chức năng:**

- Tạo danh mục mới.
- Chuẩn hóa và tạo `slug` duy nhất từ `name`.
- Tính toán `path` và `level` từ `parent`.
- Gán `parent` và `children` đúng kiểu `ObjectId`.
- Nếu có `parent`, gọi `addChildToParent()` để cập nhật ngược chiều.

**Slug logic:**

```ts
const slug = await generateUniqueSlug(dto.name, this.repository['model']);
```

**Trả về:** `{ message, data }` với `data` là danh mục đã tạo.

---

### 🛠 `update(slug, dto: UpdateCategoryPostDto)`

**Chức năng:**

- Tìm danh mục theo `slug`.
- Nếu `dto.slug` khác slug cũ → kiểm tra trùng lặp.
- Tính `path` + `level` mới nếu đổi `parent`.
- Ép kiểu `ObjectId` cho `parent`/`children`.
- ✉️ **Chống vòng lặp phân cấp**: không cho một danh mục làm cha của chính nó hoặc làm cha của tổ tiên nó.

**Trả về:** `{ message, data }` là danh mục đã cập nhật.

---

### 🌳 `findOne(slug: string)`

**Chức năng:**

- Lấy thông tin danh mục theo `slug`.
- Duyệt **đệ quy** toàn bộ danh mục con (theo trường `children`) bằng `buildCategoryTree()`.

**Trả về:** Cấu trúc cây danh mục đầy đủ (`CategoryPostTree`).

---

### 📄 `findAll(page = 1, limit = 10)`

**Chức năng:**

- Trả về tất cả danh mục chưa bị xóa (`isDeleted = false`) theo `page`, `limit`.
- Sắp xếp theo `sortOrder ASC`, `createdAt DESC`.

**Trả về:** Danh sách danh mục phân trang.

---

### 🚑 `softDelete(slug: string)`

**Chức năng:**

- Đặt `isDeleted = true` cho danh mục tương ứng.
- Cho phép khôi phục hoặc truy vết về sau.

---

### ❌ `hardDelete(slug: string)`

**Chức năng:**

- Xóa hoàn toàn khỏi DB.
- Không thể phục hồi.

---

## 📦 CategoryPostTree

```ts
export interface CategoryPostTree {
  _id: string;
  name: string;
  slug: string;
  level: number;
  parent: string | null;
  children: CategoryPostTree[];
  path: string;
  isDeleted: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
```

> ⚠️ Interface này được dùng trong `findOne()` để build cây danh mục đệ quy.

---

## 🤔 Ghi chú kỹ thuật

- ✅ **Slug sinh từ name** → chuẩn SEO.
- ✅ **Không dùng `id` trong API** → thay bằng `slug`.
- ✅ **Tự động cập nhật `children`** khi tạo danh mục con.
- ✅ **Truy vấn đệ quy** dùng `buildCategoryTree()` + `.toObject()`.

---

## 📌 Đề xuất mở rộng

| Tính năng             | Gợi ý triển khai                    |
| --------------------- | ----------------------------------- |
| 🗕️ Tìm kiếm theo tên  | `findByName(name: string)`          |
| 🔹 Lọc theo cấp độ    | `findByLevel(level: number)`        |
| 🔒 Trường `isVisible` | Giúp ẩn/hiện trên UI thay cho xoá   |
| 😷 Di chuyển danh mục | `moveCategory(slug, newParentSlug)` |
