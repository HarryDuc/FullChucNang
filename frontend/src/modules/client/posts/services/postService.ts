import axios from "axios";
import { API_URL } from "@/config/config";
import { apiRoutes } from "@/config/apiRoutes";
import { Post } from "../models/post.model";

// ✅ Tạo instance của Axios để gọi API
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json", // ✅ Định dạng JSON thay vì multipart/form-data
    },
});

/**
 * ✅ Gửi yêu cầu tạo bài viết (Gửi JSON, không gửi file)
 * @param data - Dữ liệu bài viết (bao gồm danh sách URLs ảnh)
 * @returns Bài viết đã tạo
 */
export const createPost = async (data: { title: string; content: string; author: string; thumbnail?: string[] }): Promise<Post> => {
    console.log(`📤 Gửi yêu cầu tạo bài viết đến: ${API_URL}${apiRoutes.POSTS.CREATE}`);
    console.log("📦 Dữ liệu gửi lên:", data);

    try {
        const response = await api.post(apiRoutes.POSTS.CREATE, data);
        console.log("✅ Phản hồi từ server:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("❌ Lỗi từ backend:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * ✅ Hàm lấy danh sách bài viết
 * @returns Danh sách bài viết
 */
export const getPosts = async (): Promise<Post[]> => {
    try {
        console.log("📤 Gửi yêu cầu lấy danh sách bài viết");
        const response = await api.get(apiRoutes.POSTS.BASE);
        console.log("✅ Nhận danh sách bài viết:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("❌ Lỗi khi lấy danh sách bài viết:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * ✅ Hàm lấy bài viết theo ID
 * @param id - ID bài viết
 * @returns Bài viết theo ID
 */
export const getPostById = async (id: string): Promise<Post> => {
    try {
        console.log(`📤 Gửi yêu cầu lấy bài viết ID: ${id}`);
        const response = await api.get(apiRoutes.POSTS.GET_BY_SLUG(id));
        console.log("✅ Nhận bài viết:", response.data);
        return response.data;
    } catch (error: any) {
        console.error(`❌ Lỗi khi lấy bài viết ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * ✅ Hàm cập nhật bài viết
 * @param id - ID bài viết
 * @param data - Dữ liệu JSON để cập nhật bài viết
 * @returns Bài viết đã cập nhật
 */
export const updatePost = async (id: string, data: { title: string; content: string; author: string; thumbnail?: string[] }): Promise<Post> => {
    console.log(`📤 Gửi yêu cầu cập nhật bài viết ID: ${id}`);
    console.log("📦 Dữ liệu cập nhật:", data);

    try {
        const response = await api.put(apiRoutes.POSTS.UPDATE(id), data);
        console.log("✅ Bài viết đã cập nhật:", response.data);
        return response.data;
    } catch (error: any) {
        console.error(`❌ Lỗi khi cập nhật bài viết ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * ✅ Hàm xóa bài viết
 * @param id - ID bài viết
 */
export const deletePost = async (id: string): Promise<void> => {
    console.log(`📤 Gửi yêu cầu xóa bài viết ID: ${id}`);

    try {
        await api.delete(apiRoutes.POSTS.DELETE(id));
        console.log(`✅ Xóa bài viết ID ${id} thành công`);
    } catch (error: any) {
        console.error(`❌ Lỗi khi xóa bài viết ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
};
