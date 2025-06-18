"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CreatePostDto,
  UpdatePostDto,
  Category,
  CategoryInfo,
} from "../models/post.model";
import PostCategoryTree from "./CategoryPostTree";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import { usePosts } from "@/modules/admin/posts/hooks/usePosts";
import SunEditer from "../../common/components/SunEditer";

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
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(initialData?.name || "");
  const [excerpt, setExcerpt] = useState("");
  const [postData, setPostData] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const initialThumbnail = getInitialThumbnail(initialData);

  const [publishedDate, setPublishedDate] = useState("");
  const [publishedTime, setPublishedTime] = useState("");
  const [slug, setSlug] = useState(
    isEdit && initialData?.slug ? initialData.slug : ""
  );

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
    if (!name.trim()) {
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
        thumbnailUrls = [new URL(url, window.location.origin).pathname];
      } catch {
        alert("❌ Upload ảnh thất bại");
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
      name: name.trim(),
      excerpt: removeDomain(excerpt),
      postData: removeDomain(postData),
      author: "Admin",
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
      } else {
        // Create: ép luôn id="" & slug=""
        const payload: CreatePostDto = {
          id: "",
          slug: "",
          ...common,
        };
        await createMutation.mutateAsync(payload);
      }
      router.push("/admin/posts");
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
              value={name}
              onChange={(e) => setName(e.target.value)}
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

          {/* Excerpt */}
          <div>
            <label className="block font-medium mb-1">Mô tả ngắn</label>
            <SunEditor
              height="300px"
              setContents={excerpt}
              onChange={(c) => setExcerpt(c)}
              setOptions={{
                buttonList: [
                  [
                    "undo",
                    "redo",
                    "bold",
                    "italic",
                    "underline",
                    "strike",
                    "subscript",
                    "superscript",
                    "font",
                    "fontSize",
                    "formatBlock",
                    "paragraphStyle",
                    "blockquote",
                    "align",
                    "list",
                    "lineHeight",
                    "horizontalRule",
                    "table",
                    "link",
                    "image",
                    "video",
                    "audio",
                    "imageGallery",
                    "fullScreen",
                    "showBlocks",
                    "codeView",
                    "preview",
                    "print",
                    "removeFormat",
                  ],
                ],
                defaultStyle: "z-index: 10; position: relative;",
              }}
            />
          </div>

          {/* Nội dung */}
          <div>
            <label className="block font-medium mb-1">Nội dung</label>

            <SunEditor
              height="500px"
              setContents={postData}
              onChange={(c) => setPostData(c)}
              setOptions={{
                buttonList: [
                  [
                    "undo",
                    "redo",
                    "bold",
                    "italic",
                    "underline",
                    "strike",
                    "subscript",
                    "superscript",
                    "font",
                    "fontSize",
                    "formatBlock",
                    "paragraphStyle",
                    "blockquote",
                    "align",
                    "list",
                    "lineHeight",
                    "horizontalRule",
                    "table",
                    "link",
                    "image",
                    "video",
                    "audio",
                    "imageGallery",
                    "fullScreen",
                    "showBlocks",
                    "codeView",
                    "preview",
                    "print",
                    "removeFormat",
                  ],
                ],
                defaultStyle: "position: relative;",
              }}
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
              <img
                src={URL.createObjectURL(thumbnailFile)}
                alt="preview"
                className="w-24 h-24 mt-2 rounded shadow"
              />
            ) : initialThumbnail ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${initialThumbnail}`}
                alt="preview"
                className="w-24 h-24 mt-2 rounded shadow"
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

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push("/admin/posts")}
          disabled={isSubmitting}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-2 rounded text-white ${
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
