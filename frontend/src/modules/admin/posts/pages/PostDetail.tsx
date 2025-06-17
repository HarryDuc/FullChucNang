import { useEffect, useState } from "react";
import { usePosts } from "../hooks/usePosts";
import { Post } from "../types/postTypes";
import Link from "next/link";

type PostDetailProps = {
    postId: string; // ✅ Nhận `postId` từ trang cha
};

const PostDetail: React.FC<PostDetailProps> = ({ postId }) => {
    const { postQuery } = usePosts(); // ✅ Gọi API lấy bài viết
    const [post, setPost] = useState<Post | null>(null);

    // ✅ Gọi API khi `postId` thay đổi
    useEffect(() => {
        if (postId) {
            postQuery(postId).refetch().then(({ data }) => {
                if (data) setPost(data);
            });
        }
    }, [postId, postQuery]);

    if (!post) return <p className="text-center mt-10">Đang tải bài viết...</p>;

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            <p className="text-gray-600 mb-2">📝 <strong>Tác giả:</strong> {post.author ?? "Không rõ"}</p>
            <p className="text-sm text-gray-400 mb-4">📅 {new Date(post.createdAt ?? "").toLocaleString()}</p>

            {/* ✅ Hiển thị ảnh nếu có */}
            {post.thumbnail && post.thumbnail.length > 0 && (
                <div className="mb-4">
                    <img src={post.thumbnail[0]} alt="Thumbnail" className="max-w-full h-auto rounded-lg shadow-md" />
                </div>
            )}

            <p className="text-lg text-gray-800 leading-relaxed">{post.content}</p>

            <div className="mt-6">
                <Link href="/posts">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                        🔙 Quay lại danh sách bài viết
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default PostDetail;
