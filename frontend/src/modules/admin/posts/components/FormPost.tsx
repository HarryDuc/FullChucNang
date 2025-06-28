"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CreatePostDto,
  UpdatePostDto,
  Category,
  CategoryInfo,
  PostStatus,
  Post,
} from "../models/post.model";
import PostCategoryTree from "./CategoryPostTree";
import { usePosts } from "@/modules/admin/posts/hooks/usePosts";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import SunEditerUploadImage from "../../common/components/SunEditer";

/** Loại bỏ domain từ HTML, chỉ giữ phần relative */
const removeDomain = (html: string): string =>
  html.replace(new RegExp(`${process.env.NEXT_PUBLIC_API_URL}`, "g"), "");

/** Lấy thumbnail gốc nếu edit */
const getInitialThumbnail = (initialData?: CreatePostDto | UpdatePostDto) =>
  initialData?.thumbnail?.[0] || "";

type Props = {
  initialData?: CreatePostDto | UpdatePostDto;
  isEdit?: boolean;
  onSubmit?: (data: CreatePostDto | UpdatePostDto, slug?: string) => void;
};

const PostForm: React.FC<Props> = ({ initialData, isEdit = false }) => {
  const {
    categoriesQuery,
    uploadImageMutation,
    createMutation,
    updateMutation,
  } = usePosts();
  const { user } = useAuth();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(initialData?.title || "");
  const [excerpt, setExcerpt] = useState("");
  const [postData, setPostData] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const initialThumbnail = getInitialThumbnail(initialData);

  const [publishedDate, setPublishedDate] = useState("");
  const [publishedTime, setPublishedTime] = useState("");
  const [slug, setSlug] = useState(
    isEdit && initialData?.slug ? initialData.slug : ""
  );
  const [, setFormData] = useState<Partial<Post>>({
    title: "",
    excerpt: "",
    postData: "",
    author: user?.fullName || "",
    thumbnail: [],
    publishedDate: new Date().toISOString(),
    category: { main: [], sub: [] },
    status: PostStatus.Draft,
    isVisible: true,
  });
  // load excerpt & postData ban đầu
  useEffect(() => {
    if (initialData?.excerpt) {
      setExcerpt(
        initialData.excerpt.replace(
          /src="\/uploads/g,
          `src="${process.env.NEXT_PUBLIC_API_URL}/uploads`
        )
      );
    }
    if (initialData?.postData) {
      setPostData(
        initialData.postData.replace(
          /src="\/uploads/g,
          `src="${process.env.NEXT_PUBLIC_API_URL}/uploads`
        )
      );
    }
  }, [initialData]);

  // khởi tạo ngày giờ input
  useEffect(() => {
    const date = new Date(initialData?.publishedDate || Date.now());

    // Lấy ngày theo UTC để tránh lệch múi giờ
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    setPublishedDate(`${y}-${m}-${d}`);

    // Lấy giờ phút theo UTC
    const hh = String(date.getUTCHours()).padStart(2, "0");
    const mm = String(date.getUTCMinutes()).padStart(2, "0");
    setPublishedTime(`${hh}:${mm}`);
  }, [initialData, isEdit]);

  const [selectedCategoryNames, setSelectedCategoryNames] = useState<string[]>(
    []
  );

  useEffect(() => {
    if (isEdit && initialData?.category) {
      const selectedNames = [
        ...initialData.category.main,
        ...initialData.category.sub,
      ];
      setSelectedCategoryNames(selectedNames);
    }
  }, [initialData, isEdit]); // ✅ Lắng nghe toàn bộ initialData thay vì category riêng lẻ

  const handleCategoryChange = (cat: Category, checked: boolean) => {
    setSelectedCategoryNames((prev) =>
      checked ? [...prev, cat.name] : prev.filter((n) => n !== cat.name)
    );
  };

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setThumbnailFile(e.target.files[0]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("❌ Tiêu đề không được để trống!");
      return;
    }
    setIsSubmitting(true);

    // to ISO UTC
    let publishedISO: string;
    try {
      const [yy, mm, dd] = publishedDate.split("-").map(Number);
      const [hh, min] = publishedTime.split(":").map(Number);
      publishedISO = new Date(Date.UTC(yy, mm - 1, dd, hh, min)).toISOString();
    } catch {
      alert("❌ Ngày giờ không hợp lệ");
      setIsSubmitting(false);
      return;
    }

    // upload thumbnail
    let thumbnailUrls: string[] = [];
    if (thumbnailFile) {
      try {
        const { url } = await uploadImageMutation.mutateAsync(thumbnailFile);
        console.log("url", url);
        if (!url) {
          throw new Error("URL ảnh không hợp lệ");
        }
        // Không cần chuyển đổi URL vì imageUrl đã là đường dẫn tương đối
        thumbnailUrls = [url];
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload ảnh thất bại";
        alert(`❌ ${errorMessage}`);
        console.error("Chi tiết lỗi upload:", error);
        setIsSubmitting(false);
        return;
      }
    } else if (initialThumbnail) {
      thumbnailUrls = [initialThumbnail];
    }

    // build categories
    const allCats = categoriesQuery.data?.data || [];
    const picked = allCats.filter((c) =>
      selectedCategoryNames.includes(c.name)
    );
    const mainCats = picked.filter((c) => c.level === 0).map((c) => c.name);
    const subCats = picked.filter((c) => c.level > 0).map((c) => c.name);
    const categoryInfo: CategoryInfo = { main: mainCats, sub: subCats };

    // các field chung
    const common = {
      title: title.trim(),
      excerpt: removeDomain(excerpt),
      postData: removeDomain(postData),
      author: user?.fullName || user?.email || "Admin",
      thumbnail: thumbnailUrls,
      publishedDate: publishedISO,
      category: categoryInfo,
    };

    try {
      if (isEdit && initialData && "slug" in initialData) {
        // Update: thêm id + slug
        const payload: UpdatePostDto = {
          id: initialData.id,
          slug: slug.trim() || initialData.slug,
          ...common,
        };
        await updateMutation.mutateAsync({
          slug: initialData.slug,
          data: payload,
        });
        // Không chuyển trang, chỉ thông báo thành công
        alert("✅ Cập nhật bài viết thành công!");
        setIsSubmitting(false);
      } else {
        // Create: ép luôn id="" & slug=""
        const payload: CreatePostDto = {
          id: "",
          slug: "",
          ...common,
        };
        await createMutation.mutateAsync(payload);
        // Không chuyển trang, chỉ thông báo thành công
        alert("✅ Tạo bài viết thành công!");
        setIsSubmitting(false);
      }
    } catch {
      alert("❌ Gửi form thất bại");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-lg bg-white shadow">
      <div className="flex flex-col md:flex-row gap-6">
        {/* LEFT */}
        <div className="md:w-8/12 space-y-6">
          {/* Tiêu đề */}
          <div>
            <label className="block font-medium mb-1">Tiêu đề</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          {/* Slug (chỉ hiển thị khi chỉnh sửa) */}
          {isEdit && (
            <div>
              <label className="block font-medium mb-1">Đường dẫn URL</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                placeholder="nhap-slug-tuy-chon"
              />
            </div>
          )}

          <div>
            <label className="block font-medium mb-1">Tóm tắt</label>
            <SunEditerUploadImage
              postData={excerpt}
              setPostData={setExcerpt}
            />
          </div>

          {/* Nội dung */}
          <div>
            <label className="block font-medium mb-1">Nội dung</label>
            <SunEditerUploadImage
              postData={postData}
              setPostData={setPostData}
            />
          </div>

          {/* Ngày giờ */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Ngày đăng</label>
              <input
                type="date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Giờ đăng</label>
              <input
                type="time"
                value={publishedTime}
                onChange={(e) => setPublishedTime(e.target.value)}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block font-medium mb-1">Ảnh đại diện</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
            />
            {thumbnailFile ? (
              <Image
                src={URL.createObjectURL(thumbnailFile)}
                alt="preview"
                className="w-24 h-24 mt-2 rounded shadow"
                width={96}
                height={96}
              />
            ) : initialThumbnail ? (
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}${initialThumbnail}`}
                alt="preview"
                className="w-24 h-24 mt-2 rounded shadow"
                width={96}
                height={96}
              />
            ) : null}
          </div>
        </div>
        {/* RIGHT: Categories */}
        <div className="md:w-4/12">
          <h3 className="text-xl font-semibold mb-3">Chọn danh mục</h3>
          {categoriesQuery.isLoading ? (
            <p>Đang tải...</p>
          ) : (
            <PostCategoryTree
              categories={categoriesQuery.data?.data || []}
              selectedCategoryNames={selectedCategoryNames}
              handleCategoryChange={handleCategoryChange}
            />
          )}
        </div>
      </div>
      {/* <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Trạng thái phê duyệt
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.values(PostStatus).map((status) => {
            const { label, color } = getStatusLabel(status);
            return (
              <button
                key={status}
                type="button"
                onClick={() => handleStatusChange(status)}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  formData.status === status
                    ? `${color} font-medium`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div> */}

      {/* Trạng thái hiển thị */}
      {/* <div className="mb-6">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isVisible}
            onChange={handleVisibilityChange}
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ms-3 text-sm font-medium text-gray-700">
            {formData.isVisible ? "Hiển thị" : "Ẩn"}
          </span>
        </label>
      </div> */}
      {/* Actions - Ghim nút vào góc phải dưới */}
      <div className="fixed bottom-6 right-6 z-50 flex gap-4">
        <button
          type="button"
          disabled={isSubmitting}
          className="px-4 py-2 bg-gray-300 rounded shadow-lg"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-2 rounded text-white shadow-lg ${
            isSubmitting ? "bg-blue-400" : "bg-blue-600"
          }`}
        >
          {isSubmitting
            ? isEdit
              ? "Đang cập nhật..."
              : "Đang tạo..."
            : isEdit
            ? "Cập nhật bài viết"
            : "Tạo bài viết"}
        </button>
      </div>
    </form>
  );
};

export default PostForm;
