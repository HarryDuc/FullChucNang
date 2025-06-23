import { useRouter } from "next/navigation";
import Link from "next/link";
import type { FC } from "react";
import type { Post } from "../models/post.model";

interface FeaturedPostProps {
  post: Post;
  getThumbnailPath: (thumbnail: any) => string;
}

const FeaturedPost: FC<FeaturedPostProps> = ({ post, getThumbnailPath }) => {
  const router = useRouter();
  const imageUrl = getThumbnailPath(post.thumbnail);
  const handleClick = () => router.push(`/posts/${post.slug}`);

  return (
    <div
      className="relative overflow-hidden rounded-xl mb-10 group cursor-pointer"
      onClick={handleClick}
      tabIndex={0}
      aria-label={post.title}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
    >
      <div className="relative h-[500px] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={post.title}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          crossOrigin="anonymous"
          loading="lazy"
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
        <div className="inline-block bg-[#021737] text-white text-xs font-semibold px-3 py-1 rounded-sm mb-3">
          Nổi Bật
        </div>
        <h2 className="text-3xl font-bold mb-3 leading-tight">{post.title}</h2>
        <div className="flex items-center text-sm mb-4 text-gray-200">
          <span>{new Date(post.publishedDate).toLocaleDateString("vi-VN")}</span>
          <span className="mx-2">•</span>
          <span>{post.author}</span>
        </div>
        <Link
          href={`/posts/${post.slug}`}
          onClick={e => e.stopPropagation()}
          className="inline-block bg-white text-black px-4 py-2 font-medium rounded-sm hover:bg-gray-100 transition-colors"
        >
          Đọc tiếp
        </Link>
      </div>
    </div>
  );
};

export default FeaturedPost;