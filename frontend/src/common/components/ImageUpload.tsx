"use client";

import React, { useState, ChangeEvent } from 'react';
import { useImageUpload } from '../hooks/useImageUpload';

interface ImageUploadProps {
    userId: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ userId }) => {
    const [file, setFile] = useState<File | null>(null);
    const { isLoading, uploadedUrl, handleUpload } = useImageUpload();

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUploadClick = () => {
        if (file) {
            handleUpload(file, userId);
        }
    };

    return (
        <div>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button onClick={handleUploadClick} disabled={isLoading}>
                {isLoading ? 'Uploading...' : 'Upload Image'}
            </button>
            {uploadedUrl && (
                <div>
                    <p>Image uploaded successfully:</p>
                    <img src={uploadedUrl} alt="Uploaded" style={{ width: '200px' }} />
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
