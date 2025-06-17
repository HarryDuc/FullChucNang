import { usePosts } from '../hooks/usePosts';
import { PostForm } from '../components/PostForm';
import { useRouter } from "next/navigation";

const CreatePostPage = () => {
    const { createMutation } = usePosts();
    const router = useRouter();

    const handleCreate = (data: any) => {
        createMutation.mutate(data, {
            onSuccess: () => router.push('/posts'),
        });
    };

    return (
        <div>
            <h1>Create New Post</h1>
            <PostForm onSubmit={handleCreate} />
        </div>
    );
};

export default CreatePostPage;
