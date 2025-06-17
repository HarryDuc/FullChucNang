import PostLayout from "@/modules/client/common/layouts/PostLayout";
import PostClientPage from "@/modules/client/pages/Posts";

export default function PostList() {
  return (
    <div>
      <PostLayout>
        <PostClientPage />
      </PostLayout>
    </div>
  );
}
