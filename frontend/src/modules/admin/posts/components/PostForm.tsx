"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CreatePostDto,
  UpdatePostDto,
  Category,
  CategoryInfo,
} from "../models/post.model";
import PostCategoryTree from "./PostCategoryTree";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
// import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useUser } from "@/modules/admin/users/hooks/useUser"; // Thêm import useUser
import { usePosts } from "../hooks/usePosts";

/**
 * Loại bỏ domain từ nội dung HTML (chỉ giữ phần relative)
 * @param html Chuỗi HTML có chứa domain
 * @returns Chuỗi HTML đã loại bỏ domain
 */
const removeDomain = (html: string): string =>
  html.replace(new RegExp(`${process.env.NEXT_PUBLIC_API_URL}`, "g"), "");

/**
 * Xây dựng cây danh mục từ danh sách phẳng
 * @param categories Danh sách danh mục dạng phẳng
 * @param parentId ID của danh mục cha (null cho danh mục gốc)
 * @param level Cấp độ của danh mục
 * @returns Mảng danh mục đã được sắp xếp theo cấu trúc cây
 */
const buildCategoryTree = (categories: any[], parentId = null, level = 0) => {
  const roots: any[] = [];

  categories
    .filter((cat) => cat.parent === parentId)
    .forEach((cat) => {
      const children = buildCategoryTree(categories, cat._id, level + 1);
      roots.push({ ...cat, children, level });
    });

  return roots;
};

type Props = {
  initialData?: CreatePostDto | UpdatePostDto;
  onSubmit: (data: CreatePostDto | UpdatePostDto, slug?: string) => void;
  isEdit?: boolean;
};

export const PostForm: React.FC<Props> = ({
  initialData,
  onSubmit,
  isEdit = false,
}) => {
  // const { user } = useAuth();
  const { user } = useUser(); // Sử dụng useUser để lấy thông tin user
  const {
    categoriesQuery,
    uploadImageMutation,
    createMutation,
    updateMutation,
  } = usePosts();

  const router = useRouter();

  // Thêm state để theo dõi trạng thái đang gửi form
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State cho các trường dữ liệu chính
  const [title, setTitle] = useState(initialData?.title || "");
  const [excerpt, setExcerpt] = useState<string>("");
  const [postData, setPostData] = useState<string>("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  // currentThumbnail lưu giá trị hiện tại từ backend (relative) và dùng để hiển thị khi không có file mới
  const [currentThumbnail, setCurrentThumbnail] = useState<string>(
    initialData?.thumbnail?.[0] || ""
  );

  // Ngày & Giờ đăng
  const [publishedDate, setPublishedDate] = useState("");
  const [publishedTime, setPublishedTime] = useState("");

  // Xử lý nội dung HTML khi có dữ liệu ban đầu
  useEffect(() => {
    // Nếu có excerpt từ DB thì thêm domain để hiển thị
    if (initialData?.excerpt) {
      const excerptWithDomain = initialData.excerpt.replace(
        /src="\/uploads/g,
        `src="/uploads`
      );
      setExcerpt(excerptWithDomain);
    } else {
      setExcerpt("");
    }

    if (initialData?.postData) {
      const postDataWithDomain = initialData.postData.replace(
        /src="\/uploads/g,
        `src="/uploads`
      );
      setPostData(postDataWithDomain);
    } else {
      setPostData("");
    }
  }, [initialData]);

  // Xử lý ngày giờ khi có dữ liệu ban đầu
  useEffect(() => {
    // Khởi tạo với ngày hiện tại
    let date = new Date();

    if (isEdit && initialData?.publishedDate) {
      try {
        // Nếu đang chỉnh sửa bài viết, sử dụng thời gian từ database
        const utcDate = new Date(initialData.publishedDate);
        date = utcDate;

        // Format ngày tháng theo định dạng YYYY-MM-DD cho input type="date"
        const year = utcDate.getUTCFullYear();
        const month = String(utcDate.getUTCMonth() + 1).padStart(2, "0");
        const day = String(utcDate.getUTCDate()).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;

        // Format giờ phút theo định dạng HH:MM cho input type="time"
        const hours = String(utcDate.getUTCHours()).padStart(2, "0");
        const minutes = String(utcDate.getUTCMinutes()).padStart(2, "0");
        const formattedTime = `${hours}:${minutes}`;

        setPublishedDate(formattedDate);
        setPublishedTime(formattedTime);
      } catch (error) {
        console.error("❌ Lỗi chuyển đổi ngày tháng:", error);
      }
    } else {
      // Nếu đang thêm mới, sử dụng thời gian hiện tại
      date = new Date();

      // Format ngày tháng theo định dạng YYYY-MM-DD cho input type="date"
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      // Format giờ phút theo định dạng HH:MM cho input type="time"
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const formattedTime = `${hours}:${minutes}`;

      setPublishedDate(formattedDate);
      setPublishedTime(formattedTime);
    }
  }, [initialData?.publishedDate, isEdit]);

  // Danh mục bài viết - Sử dụng tên danh mục thay vì lưu cả object
  const [selectedCategoryNames, setSelectedCategoryNames] = useState<string[]>(
    []
  );

  // Cập nhật danh mục khi có dữ liệu ban đầu
  useEffect(() => {
    if (isEdit && (initialData as any)?.category) {
      const mainCategories = (initialData as any).category.main || [];
      const subCategories = (initialData as any).category.sub || [];

      // Gộp tất cả danh mục đã chọn vào một mảng tên
      const allSelectedNames = Array.isArray(mainCategories)
        ? mainCategories
        : [mainCategories];

      if (Array.isArray(subCategories)) {
        allSelectedNames.push(...subCategories);
      }

      setSelectedCategoryNames(allSelectedNames);
    }
  }, [initialData, isEdit]);

  // Xử lý khi chọn/bỏ chọn danh mục
  const handleCategoryChange = (category: Category, checked: boolean) => {
    setSelectedCategoryNames((prev) => {
      if (checked) return [...prev, category.name];
      return prev.filter((name) => name !== category.name);
    });
  };

  // Xử lý thay đổi file ảnh đại diện
  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  // Xử lý gửi form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("❌ Tiêu đề không được để trống!");
      return;
    }

    // Bắt đầu hiệu ứng loading
    setIsSubmitting(true);

    // Tạo ngày giờ đăng ở định dạng UTC
    let publishedDateTime;
    try {
      // Tạo đối tượng Date từ ngày và giờ đã chọn
      const [year, month, day] = publishedDate.split("-").map(Number);
      const [hours, minutes] = publishedTime.split(":").map(Number);

      // Tạo thời gian UTC trực tiếp
      const utcDate = new Date(
        Date.UTC(year, month - 1, day, hours, minutes, 0, 0)
      );

      publishedDateTime = utcDate.toISOString();
    } catch (error) {
      console.error("❌ Lỗi định dạng ngày giờ:", error);
      alert("Ngày giờ đăng không hợp lệ!");
      setIsSubmitting(false); // Dừng loading nếu có lỗi
      return;
    }

    // Xử lý ảnh đại diện
    let thumbnailUrls: string[] = [];
    if (thumbnailFile) {
      try {
        const { url } = await uploadImageMutation.mutateAsync(thumbnailFile);
        const cleanUrl = new URL(url, window.location.origin).pathname;
        thumbnailUrls = [cleanUrl];
      } catch (error) {
        console.error("❌ Upload thumbnail lỗi:", error);
        alert("Upload ảnh đại diện thất bại.");
        setIsSubmitting(false); // Dừng loading nếu có lỗi
        return;
      }
    } else if (currentThumbnail) {
      const cleanUrl = new URL(
        currentThumbnail,
        process.env.NEXT_PUBLIC_API_URL
      ).pathname;
      thumbnailUrls = [cleanUrl];
    }

    // Phân loại danh mục theo level
    const categoriesData = categoriesQuery.data?.data || [];
    const selectedCategories = categoriesData.filter((cat: Category) =>
      selectedCategoryNames.includes(cat.name)
    );

    const mainCategories = selectedCategories
      .filter((cat: Category) => cat.level === 0)
      .map((cat: Category) => cat.name);

    const subCategories = selectedCategories
      .filter((cat: Category) => cat.level > 0)
      .map((cat: Category) => cat.name);

    const category: CategoryInfo = {
      main: mainCategories,
      sub: subCategories,
    };

    // Tạo payload để gửi lên server
    let payload: CreatePostDto | UpdatePostDto;
    if (isEdit && initialData && 'id' in initialData) {
      payload = {
        id: initialData.id,
        title: title.trim(),
        excerpt: removeDomain(excerpt),
        postData: removeDomain(postData),
        author: user?.fullName || "Admin",
        thumbnail: thumbnailUrls[0] || "",
        publishedDate: publishedDateTime,
        category,
      };
    } else {
      payload = {
        title: title.trim(),
        excerpt: removeDomain(excerpt),
        postData: removeDomain(postData),
        author: user?.fullName || "Admin",
        thumbnail: thumbnailUrls[0] || "",
        publishedDate: publishedDateTime,
        category,
      };
    }

    try {
      if (isEdit && (initialData as any)?.slug) {
        // Ensure payload is UpdatePostDto
        if (!('id' in payload)) {
          alert('❌ Dữ liệu cập nhật thiếu id!');
          setIsSubmitting(false);
          return;
        }
        await updateMutation.mutateAsync({
          slug: (initialData as any).slug,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      router.push("/admin/posts");
    } catch (error) {
      console.error("❌ Gửi form thất bại:", error);
      alert("Gửi bài viết thất bại!");
      setIsSubmitting(false); // Dừng loading nếu có lỗi
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-lg">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Cột trái: Thông tin bài viết */}
        <div className="md:w-8/12">
          <div className="bg-white shadow rounded mb-4 p-4">
            <h3 className="text-xl font-semibold mb-4">Thông tin bài viết</h3>
            {/* Tiêu đề */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Tiêu đề</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            {/* Mô tả ngắn */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Mô tả ngắn</label>
              <SunEditor
                key={isEdit ? "editor-excerpt-edit" : "editor-excerpt-create"}
                height="300px"
                setContents={excerpt}
                onChange={(content) => {
                  // Giữ lại nội dung hiển thị có domain để preview
                  setExcerpt(content);
                }}
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
                onImageUploadBefore={(files, info, uploadHandler) => {
                  const formData = new FormData();
                  formData.append("file", files[0]);
                  fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/sunEditor`, {
                    method: "POST",
                    body: formData,
                  })
                    .then(async (res) => {
                      const data = await res.json();
                      if (res.ok) {
                        // Full URL từ API dùng cho hiển thị preview trong editor
                        const fullUrl = data.result[0].url;
                        uploadHandler({
                          result: [
                            {
                              url: fullUrl,
                              name: files[0].name,
                              size: files[0].size,
                            },
                          ],
                        });
                      } else {
                        throw new Error(data.message || "Lỗi upload");
                      }
                    })
                    .catch((error) => {
                      console.error("❌ Lỗi upload file:", error);
                      uploadHandler("Upload thất bại");
                    });
                  return undefined;
                }}
              />
            </div>

            {/* Nội dung bài viết */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Nội dung</label>
              <SunEditor
                key={isEdit ? "editor-postData-edit" : "editor-postData-create"}
                height="300px"
                setContents={postData}
                onChange={(content) => {
                  setPostData(content);
                }}
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
                onImageUploadBefore={(files, info, uploadHandler) => {
                  const formData = new FormData();
                  formData.append("file", files[0]);
                  fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/sunEditor`, {
                    method: "POST",
                    body: formData,
                  })
                    .then(async (res) => {
                      const data = await res.json();
                      if (res.ok) {
                        const fullUrl = data.result[0].url;
                        const relativeUrl = new URL(fullUrl).pathname;
                        // Khi hiển thị trong editor, nối domain để preview
                        uploadHandler({
                          result: [
                            {
                              url: `${process.env.NEXT_PUBLIC_API_URL}${relativeUrl}`,
                              name: files[0].name,
                              size: files[0].size,
                            },
                          ],
                        });
                      } else {
                        throw new Error(data.message || "Lỗi upload");
                      }
                    })
                    .catch((error) => {
                      console.error("❌ Lỗi upload file:", error);
                      uploadHandler("Upload thất bại");
                    });
                  return undefined;
                }}
              />
            </div>

            {/* Ngày giờ đăng */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1 font-medium">Ngày đăng</label>
                <input
                  type="date"
                  value={publishedDate}
                  onChange={(e) => setPublishedDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Giờ đăng</label>
                <input
                  type="time"
                  value={publishedTime}
                  onChange={(e) => setPublishedTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>

            {/* Ảnh đại diện */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Ảnh đại diện</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
              {thumbnailFile && (
                <img
                  src={URL.createObjectURL(thumbnailFile)}
                  alt="Preview"
                  className="w-24 h-24 mt-2 rounded shadow"
                />
              )}
              {!thumbnailFile && currentThumbnail && (
                <img
                  src={`${currentThumbnail}`}
                  alt="Preview"
                  className="w-24 h-24 mt-2 rounded shadow"
                />
              )}
            </div>
          </div>
        </div>

        {/* Cột phải: Chọn danh mục */}
        <div className="md:w-4/12">
          <div className="bg-white shadow rounded mb-4 p-4">
            <h3 className="text-xl font-semibold mb-4">Chọn danh mục</h3>
            {categoriesQuery.isLoading ? (
              <p>Đang tải danh mục...</p>
            ) : categoriesQuery.data?.data?.length ? (
              <PostCategoryTree
                categories={categoriesQuery.data.data}
                selectedCategoryNames={selectedCategoryNames}
                handleCategoryChange={handleCategoryChange}
              />
            ) : (
              <p>Không có danh mục</p>
            )}
          </div>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/posts")}
          className="px-4 py-2 bg-gray-500 text-white rounded"
          disabled={isSubmitting} // Vô hiệu hóa nút khi đang gửi
        >
          Hủy
        </button>
        <button
          type="submit"
          className={`px-4 py-2 ${isSubmitting ? "bg-blue-400" : "bg-blue-600"
            } text-white rounded flex items-center justify-center min-w-[150px]`}
          disabled={isSubmitting} // Vô hiệu hóa nút khi đang gửi
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {isEdit ? "Đang cập nhật..." : "Đang tạo..."}
            </>
          ) : (
            <>{isEdit ? "Cập nhật bài viết" : "Tạo bài viết"}</>
          )}
        </button>
      </div>
    </form>
  );
};

export default PostForm;
