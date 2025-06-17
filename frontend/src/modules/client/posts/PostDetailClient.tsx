"use client";
import Link from "next/link";
import { usePostBySlug, usePosts } from "./hooks/usePosts";
import { transformSunEditorHtml } from "@/common/utils/transformSunEditorHtml"; // ✅ Import hàm xử lý ảnh
import BackToPostsLink from "./components/BackToPostsLink";
import PostMeta from "./components/PostMeta";
import PostThumbnail from "./components/PostThumbnail";
import PostExcerpt from "./components/PostExcerpt";
import PostContent from "./components/PostContent";
import RecentPostsList from "./components/RecentPostsList";
import TagList from "./components/TagList";

interface PostDetailProps {
  slug: string;
}

export default function PostDetailClient({ slug }: PostDetailProps) {
  const { data: post, isLoading, isError } = usePostBySlug(slug);
  const { postsQuery } = usePosts();
  const recentPosts = postsQuery.data?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2">Đang tải bài viết...</p>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">
          Không thể tải bài viết. Bài viết không tồn tại hoặc đã bị xóa.
        </p>
        <Link href="/posts" className="inline-block mt-4 text-blue-600">
          Quay lại danh sách bài viết
        </Link>
      </div>
    );
  }

  const getThumbnailPath = (thumbnail: any): string => {
    if (!thumbnail) return "/placeholder.svg?height=800&width=1200";
    const path = Array.isArray(thumbnail) ? thumbnail[0] : thumbnail;

    if (
      typeof path === "string" &&
      (path.startsWith("http://") || path.startsWith("https://"))
    ) {
      return path;
    }

    if (typeof path === "string" && path.startsWith("/uploads")) {
      return `${path}`;
    }

    return path || "/placeholder.svg?height=800&width=1200";
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Phần nội dung chính */}
      <div className="md:col-span-2">
        <BackToPostsLink />
        <article>
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <PostMeta publishedDate={post.publishedDate} author={post.author} />
          <PostThumbnail src={getThumbnailPath(post.thumbnail) || "/placeholder.svg?height=800&width=1200"} alt={post.title} />
          <PostExcerpt html={transformSunEditorHtml(post.excerpt)} />
          <PostContent
            html={
              post.postData && typeof post.postData === "string"
                ? transformSunEditorHtml(
                  post.postData.replace(/<p>Mô tả ngắn<\/p>/g, "")
                )
                : ""
            }
          />
        </article>
      </div>

      {/* Sidebar - Bên phải */}
      <aside className="md:col-span-1">
        <div className="sticky ">
          <RecentPostsList posts={recentPosts} currentSlug={slug} getThumbnailPath={getThumbnailPath} />
          <TagList />
        </div>
      </aside>
    </div>
  );
}
