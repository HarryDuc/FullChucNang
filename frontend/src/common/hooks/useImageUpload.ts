import { useState } from 'react';
import { uploadImage } from '../services/imageService1';

export const useImageUpload = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

    const handleUpload = async (file: File, userId: string) => {
        setIsLoading(true);
        try {
            const response = await uploadImage(file, userId);
            setUploadedUrl(response.url);
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return { isLoading, uploadedUrl, handleUpload };
};
