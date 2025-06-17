"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { FC } from "react";
import type { Post } from "../models/post.model";

interface SecondaryFeaturedPostProps {
  post: Post;
  getThumbnailPath: (thumbnail: any) => string;
}

const SecondaryFeaturedPost: FC<SecondaryFeaturedPostProps> = ({ post, getThumbnailPath }) => {
  const router = useRouter();
  const imageUrl = getThumbnailPath(post.thumbnail);
  const handleClick = () => router.push(`/posts/${post.slug}`);

  return (
    <div
      className="grid md:grid-cols-5 gap-6 items-center mb-8 pb-8 border-b cursor-pointer"
      onClick={handleClick}
      tabIndex={0}
      aria-label={post.title}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
    >
      <div className="md:col-span-2 relative h-[240px] overflow-hidden rounded-lg">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={post.title}
          className="object-cover w-full h-full"
          crossOrigin="anonymous"
          loading="lazy"
        />
      </div>
      <div className="md:col-span-3">
        <h2 className="text-2xl font-bold mb-3 hover:text-[#021737] transition-colors">
          <Link
            href={`/posts/${post.slug}`}
            onClick={e => e.stopPropagation()}
          >
            {post.title}
          </Link>
        </h2>
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <span>{new Date(post.publishedDate).toLocaleDateString("vi-VN")}</span>
          <span className="mx-2">•</span>
          <span>{post.author}</span>
        </div>
        <div
          className="text-gray-700 mb-4"
          dangerouslySetInnerHTML={{ __html: post.excerpt }}
        />
        <Link
          href={`/posts/${post.slug}`}
          onClick={e => e.stopPropagation()}
          className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 font-medium rounded-sm transition-colors"
        >
          Đọc tiếp
        </Link>
      </div>
    </div>
  );
};

export default SecondaryFeaturedPost;