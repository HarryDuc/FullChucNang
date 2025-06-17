import { useEffect, useState } from "react";
import { usePosts } from "../../hooks/usePosts";
import { PostForm } from "../../components/PostForm";
import { useRouter } from "next/navigation";
import { UpdatePostDto } from "../../types/postTypes";

const EditPostPage = () => {
    const { updateMutation, postQuery } = usePosts();
    const router = useRouter();
    const { id } = router.query;

    // ✅ Trạng thái lưu bài viết
    const [post, setPost] = useState<UpdatePostDto | null>(null);

    // ✅ Lấy bài viết theo ID và cập nhật trạng thái
    useEffect(() => {
        if (typeof id === "string") {
            postQuery(id).refetch().then(({ data }) => {
                if (data) {
                    setPost({
                        id: data.id,
                        title: data.title,
                        content: data.content,
                        author: data.author ?? "Unknown", // ✅ Tránh lỗi undefined
                        thumbnail: data.thumbnail || [] // ✅ Đảm bảo là mảng URL
                    });
                }
            });
        }
    }, [id, postQuery]);

    if (!post) return <p>Loading...</p>;

    // ✅ Xử lý cập nhật bài viết
    const handleUpdate = (data: UpdatePostDto) => {
        const updateData: UpdatePostDto = {
            id: id as string, // ✅ Đảm bảo `id` tồn tại
            title: data.title ?? "No Title",
            content: data.content ?? "No Content",
            author: data.author ?? "Unknown",
            thumbnail: data.thumbnail || [],
        };

        updateMutation.mutate(updateData, {
            onSuccess: () => router.push("/posts"),
        });
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-semibold mb-4">Chỉnh sửa bài viết</h1>
            <PostForm initialData={post} onSubmit={handleUpdate} isEdit />
        </div>
    );
};

export default EditPostPage;
