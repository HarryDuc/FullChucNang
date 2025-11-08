# Upimg API Documentation

## Tổng quan
API `upimgapi` cho phép tạo và quản lý các phần nội dung có tiêu đề và ảnh. Mỗi phần có thể chứa nhiều ảnh và được sắp xếp theo thứ tự.

## Endpoints

### 1. Tạo upimg mới
```http
POST /upimgapi
Content-Type: application/json

{
  "title": "Tiêu đề phần nội dung (tùy chọn)",
  "description": "Mô tả (tùy chọn)",
  "imageIds": ["image_id_1", "image_id_2"],
  "status": "active",
  "order": 1,
  "slug": "tieu-de-phan-noi-dung",
  "metadata": {}
}
```

### 2. Tạo upimg với upload ảnh
```http
POST /upimgapi/upload
Content-Type: multipart/form-data

{
  "title": "Tiêu đề phần nội dung (tùy chọn)",
  "description": "Mô tả (tùy chọn)",
  "status": "active",
  "order": 1
}

files: [file1.jpg, file2.png, ...]
```

### 3. Lấy danh sách upimg
```http
GET /upimgapi
GET /upimgapi?status=active
GET /upimgapi?order=1
```

### 4. Lấy upimg theo ID
```http
GET /upimgapi/:id
```

### 5. Lấy upimg theo slug
```http
GET /upimgapi/slug/:slug
```

### 6. Cập nhật upimg
```http
PUT /upimgapi/:id
Content-Type: application/json

{
  "title": "Tiêu đề mới (tùy chọn)",
  "description": "Mô tả mới (tùy chọn)",
  "imageIds": ["new_image_id_1", "new_image_id_2"],
  "status": "inactive",
  "order": 2
}
```

### 7. Cập nhật upimg với upload ảnh
```http
PUT /upimgapi/:id/upload
Content-Type: multipart/form-data

{
  "title": "Tiêu đề mới (tùy chọn)",
  "description": "Mô tả mới (tùy chọn)",
  "status": "active"
}

files: [new_file1.jpg, new_file2.png, ...]
```

### 8. Xóa upimg
```http
DELETE /upimgapi/:id
```

### 9. Thêm ảnh vào upimg
```http
POST /upimgapi/:id/images
Content-Type: application/json

{
  "imageIds": ["image_id_1", "image_id_2"]
}
```

### 10. Xóa ảnh khỏi upimg
```http
DELETE /upimgapi/:id/images/:imageId
```

### 11. Cập nhật thứ tự
```http
PUT /upimgapi/:id/order
Content-Type: application/json

{
  "order": 5
}
```

### 12. Tìm kiếm
```http
GET /upimgapi/search/:keyword
```

### 13. Lọc theo trạng thái
```http
GET /upimgapi/status/:status
```

## Cấu trúc dữ liệu

### Upimg Schema
```typescript
{
  _id: ObjectId,
  title?: string,          // Tiêu đề (tùy chọn)
  description?: string,    // Mô tả (tùy chọn)
  images: ObjectId[],      // Danh sách ID ảnh
  status: 'active' | 'inactive',
  order: number,           // Thứ tự sắp xếp
  slug?: string,           // URL-friendly string
  metadata?: object,       // Dữ liệu bổ sung
  createdAt: Date,
  updatedAt: Date
}
```

### Response với populate images
```typescript
{
  _id: ObjectId,
  title?: string,
  description?: string,
  images: [
    {
      _id: ObjectId,
      originalName: string,
      imageUrl: string,
      location: string,
      slug: string,
      alt?: string,
      caption?: string,
      // ... other image fields
    }
  ],
  status: string,
  order: number,
  slug?: string,
  metadata?: object,
  createdAt: Date,
  updatedAt: Date
}
```

## Tính năng

- ✅ **Tạo nhiều phần nội dung** với tiêu đề và ảnh (tiêu đề và mô tả không bắt buộc)
- ✅ **Upload ảnh trực tiếp** khi tạo/cập nhật
- ✅ **Quản lý ảnh** (thêm/xóa ảnh vào phần)
- ✅ **Sắp xếp thứ tự** các phần
- ✅ **Tìm kiếm** theo tiêu đề và mô tả
- ✅ **Lọc theo trạng thái** (active/inactive)
- ✅ **Slug tự động** từ tiêu đề (hoặc 'untitled' nếu không có tiêu đề)
- ✅ **Validation** đầy đủ cho tất cả inputs
- ✅ **Tích hợp với Images API** có sẵn

## Lưu ý

- Mỗi phần có thể chứa nhiều ảnh
- **Tiêu đề và mô tả không bắt buộc** - có thể tạo upimg mà không cần tiêu đề
- Ảnh được lưu trữ thông qua Images API
- Slug được tự động tạo từ tiêu đề nếu không được cung cấp (sử dụng 'untitled' nếu không có tiêu đề)
- Thứ tự mặc định là 0, có thể thay đổi để sắp xếp
- Trạng thái mặc định là 'active' 