"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Post } from "../types/postTypes";
import { usePosts } from "../hooks/usePosts";

type PostItemProps = {
  post: Post;
};

export const PostItem: React.FC<PostItemProps> = ({ post }) => {
  const router = useRouter();
  const { deleteMutation } = usePosts();

  const handleDelete = async () => {
    if (confirm(`Bạn có chắc chắn muốn xóa bài viết "${post.title}"?`)) {
      deleteMutation.mutate(post.id, {
        onSuccess: () => {
          alert("✅ Bài viết đã bị xóa!");
          router.push("/posts");
        },
        onError: () => {
          alert("❌ Không thể xóa bài viết. Vui lòng thử lại.");
        },
      });
    }
  };

  return (
    <div className="p-4 border rounded-md shadow-md mb-4">
      <h2 className="text-xl font-semibold">{post.title}</h2>
      <p className="text-gray-600">{post.content}</p>
      <p className="text-sm text-gray-500">
        Tác giả: {post.author ?? "Unknown"}
      </p>
      <p className="text-xs text-gray-400">
        Ngày tạo: {new Date(post.createdAt ?? "").toLocaleString()}
      </p>

      <div className="mt-4 flex space-x-2">
        <Link href={`/posts/view/${post.id}`}>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Xem
          </button>
        </Link>

        <Link href={`/posts/edit/${post.id}`}>
          <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
            Sửa
          </button>
        </Link>

        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          Xóa
        </button>
      </div>
    </div>
  );
};
