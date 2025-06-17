export interface Post {
    id: string;
    title: string;
    content: string;
    author?: string;
    thumbnail?: string[]; // ✅ Lưu danh sách URL ảnh thay vì file
    createdAt?: Date;
    updatedAt?: Date;
}

// ✅ Định nghĩa DTO tạo bài viết
export interface CreatePostDto {
    title: string;
    content: string;
    author?: string;
    thumbnail?: string[]; // ✅ Gửi URL ảnh thay vì file
}

// ✅ Định nghĩa DTO cập nhật bài viết
export interface UpdatePostDto extends CreatePostDto {
    id: string;
}
