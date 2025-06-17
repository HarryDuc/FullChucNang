"use client";
import type { FC } from "react";
import type { Post } from "../models/post.model";

interface PostCardProps {
  post: Post;
  getThumbnailPath: (thumbnail: any) => string;
}

const PostCard: FC<PostCardProps> = ({ post, getThumbnailPath }) => {
  const imageUrl = getThumbnailPath(post.thumbnail);
  return (
    <div className="group">
      <div className="relative h-56 overflow-hidden rounded-lg mb-3">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={post.title}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          crossOrigin="anonymous"
          loading="lazy"
        />
      </div>
      <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-[#021737] transition-colors">
        {post.title}
      </h3>
      <div className="flex items-center text-xs text-gray-500 mb-2">
        <span>{new Date(post.publishedDate).toLocaleDateString("vi-VN")}</span>
        <span className="mx-2">•</span>
        <span>{post.author}</span>
      </div>
      <div
        className="text-gray-600 line-clamp-3 text-sm"
        dangerouslySetInnerHTML={{ __html: post.excerpt }}
      />
    </div>
  );
};

export default PostCard;