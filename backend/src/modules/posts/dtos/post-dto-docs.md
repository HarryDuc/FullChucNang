# 📄 Post DTO Documentation

## 🛠️ `CreatePostDto`

DTO dùng cho việc tạo mới một bài viết. Toàn bộ các trường có thể được truyền từ phía client.

### Trường bắt buộc

| Tên trường | Kiểu dữ liệu | Mô tả                        |
| ---------- | ------------ | ---------------------------- |
| `title`    | `string`     | Tiêu đề bài viết (bắt buộc). |

---

### Trường tùy chọn

| Tên trường         | Kiểu dữ liệu                  | Mô tả                                             |
| ------------------ | ----------------------------- | ------------------------------------------------- |
| `slug`             | `string`                      | Đường dẫn thân thiện với SEO.                     |
| `excerpt`          | `string`                      | Mô tả ngắn nội dung bài viết.                     |
| `postData`         | `string`                      | Nội dung chi tiết bài viết.                       |
| `coverVideo`       | `string`                      | Đường dẫn video bìa nếu có.                       |
| `thumbnail`        | `string[]`                    | Danh sách ảnh thumbnail.                          |
| `images`           | `string[]`                    | Danh sách ảnh trong bài viết.                     |
| `meta`             | [`PostMetaDto`](#postmetadto) | Metadata thống kê như lượt xem, lượt thích, v.v.  |
| `categoryPaths`    | `string[]`                    | Danh sách chuyên mục bài viết thuộc về.           |
| `tags`             | `string[]`                    | Danh sách thẻ (tags) liên quan.                   |
| `author`           | `string`                      | Tác giả bài viết (hiển thị).                      |
| `createdBy`        | `string`                      | Người tạo bài viết (ID người dùng).               |
| `updatedBy`        | `string`                      | Người cập nhật gần nhất.                          |
| `approvedBy`       | `string`                      | Người duyệt bài viết.                             |
| `publishedDate`    | `Date`                        | Thời gian xuất bản chính thức.                    |
| `scheduledAt`      | `Date`                        | Thời gian lên lịch đăng bài.                      |
| `approvedDate`     | `Date`                        | Ngày bài viết được duyệt.                         |
| `status`           | `PostStatus`                  | Trạng thái của bài viết (DRAFT, PUBLISHED, etc.). |
| `isFeatured`       | `boolean`                     | Gắn đánh dấu nổi bật.                             |
| `isPinned`         | `boolean`                     | Ghim bài viết.                                    |
| `relatedPostSlugs` | `string[]`                    | Danh sách slug bài viết liên quan.                |
| `isDeleted`        | `boolean`                     | Đánh dấu bài viết đã bị xóa mềm (soft delete).    |

---

## ♻️ `UpdatePostDto`

DTO dùng để cập nhật bài viết. **Kế thừa toàn bộ trường của `CreatePostDto` nhưng tất cả đều là `@IsOptional`.**

```ts
export class UpdatePostDto extends PartialType(CreatePostDto) {}
```

---

## 📊 `PostMetaDto`

```ts
export class PostMetaDto {
  views?: number; // Tổng lượt xem
  likes?: number; // Tổng lượt thích
  shares?: number; // Tổng lượt chia sẻ
  bookmarks?: number; // Tổng lượt lưu
}
```

> 💡 Tất cả các trường trong `PostMetaDto` đều là số và là tùy chọn.

---

## ✅ Enum `PostStatus`

```ts
export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  SCHEDULED = 'SCHEDULED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
}
```

---

## ✨ Ghi chú kỹ thuật

- Tất cả các chuỗi đều được tự động `trim()` bằng `@Transform(safeTrim)`.
- Các trường `createdAt`, `updatedAt` **không cần truyền từ client** trong `CreatePostDto` – vì được hệ thống backend tự động sinh ra.
- Trường `viewCount` đã được chuyển thành `meta.views` để cấu trúc hóa dữ liệu thống kê.
- `isDeleted` hỗ trợ soft delete, mặc định là `false`.
