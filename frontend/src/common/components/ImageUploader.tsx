import React, { useState } from "react";
import { uploadImagesToImgBB } from "@/common/utils/uploadService"; // ✅ Import module upload ảnh

type ImageUploaderProps = {
    onUploadSuccess: (imageUrls: string[]) => void; // 📌 Callback trả về URL ảnh
    multiple?: boolean; // Cho phép upload nhiều ảnh hay không
};

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUploadSuccess, multiple = true }) => {
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false); // 📌 Trạng thái đang tải ảnh
    const [uploadProgress, setUploadProgress] = useState<number>(0); // 📊 Tiến trình upload

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (files.length === 0) return;

        // ✅ Kiểm tra định dạng file (chỉ nhận ảnh)
        const validImages = files.filter((file) => file.type.startsWith("image/"));
        if (validImages.length === 0) {
            alert("❌ Vui lòng chọn file ảnh hợp lệ!");
            return;
        }

        // ✅ Cập nhật danh sách ảnh đã chọn
        setSelectedImages(validImages);
        setPreviewImages(validImages.map((file) => URL.createObjectURL(file)));
    };

    const handleUpload = async () => {
        if (selectedImages.length === 0) {
            alert("❌ Bạn chưa chọn ảnh để tải lên!");
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const uploadedUrls = await uploadImagesToImgBB(selectedImages);
            if (uploadedUrls.length > 0) {
                onUploadSuccess(uploadedUrls); // 📌 Gửi danh sách URL ảnh cho component cha
                setSelectedImages([]); // Reset danh sách file
                setPreviewImages([]); // Reset preview
            }
        } catch (error) {
            console.error("❌ Lỗi khi tải ảnh lên:", error);
            alert("⚠️ Đã xảy ra lỗi khi tải ảnh lên!");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="image-uploader p-4 border rounded-lg shadow-md bg-white">
            <label className="block text-sm font-medium">Chọn ảnh:</label>
            <input
                type="file"
                accept="image/*"
                multiple={multiple}
                onChange={handleImageChange}
                className="mt-2 w-full border rounded p-2"
            />

            {/* 📌 Hiển thị ảnh preview trước khi upload */}
            {previewImages.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                    {previewImages.map((src, index) => (
                        <img key={index} src={src} alt={`Preview ${index}`} className="w-full h-auto rounded-md shadow-sm" />
                    ))}
                </div>
            )}

            {/* 📌 Nút tải lên ảnh */}
            <button
                onClick={handleUpload}
                disabled={uploading}
                className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
            >
                {uploading ? `Đang tải... ${uploadProgress}%` : "Tải ảnh lên"}
            </button>
        </div>
    );
};

export default ImageUploader;
