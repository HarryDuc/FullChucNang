import PostDetailClient from "../posts/PostDetailClient";

export default function PostDetailClientPage({slug}: {slug: string}) {
  return <PostDetailClient slug={slug} />
}