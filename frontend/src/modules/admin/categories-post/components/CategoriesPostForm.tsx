"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  CreateCategoryPostDto,
  UpdateCategoryPostDto,
  CategoryPost,
} from "../models/categories-post.model";
import {
  useCategoryPostTree,
  useCategoryPosts,
} from "../hooks/useCategoriesPost";
import { useRouter } from "next/navigation";

type Props = {
  slug?: string;
  onSuccess?: () => void;
};

const CategoriesPostForm: React.FC<Props> = ({ slug, onSuccess }) => {
  const isEditMode = !!slug;
  const router = useRouter();
  const [allCategories, setAllCategories] = useState<CategoryPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: currentCategory } = useCategoryPostTree(slug || "");
  const { createMutation, updateMutation } = useCategoryPosts();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateCategoryPostDto>({
    defaultValues: {
      name: "",
      parent: "",
    },
  });

  // ✅ Load toàn bộ danh mục bất đồng bộ
  useEffect(() => {
    const fetchAll = async () => {
      try {
        let page = 1;
        const limit = 10;
        let all: CategoryPost[] = [];

        while (true) {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/category-postsapi?page=${page}&limit=${limit}`
          );
          const json = await res.json();
          all = [...all, ...json.data];
          if (json.data.length < limit) break;
          page++;
        }

        setAllCategories(all);
      } catch (error) {
        console.error("Lỗi khi load danh mục:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ✅ Gán giá trị khi edit sau khi có currentCategory và danh sách danh mục
  useEffect(() => {
    if (isEditMode && currentCategory && !isLoading) {
      reset({
        name: currentCategory.name,
        parent:
          typeof currentCategory.parent === "object"
            ? (currentCategory.parent as any)?._id ?? ""
            : currentCategory.parent ?? "",
      });
    }
  }, [currentCategory, isEditMode, reset, isLoading]);

  const onSubmit = async (formData: CreateCategoryPostDto) => {
    try {
      // Xử lý giá trị parent: chuyển chuỗi rỗng thành null
      const parentValue =
        formData.parent?.trim() === "" ? null : formData.parent;

      if (isEditMode && currentCategory) {
        if (!formData.name?.trim()) {
          alert("⚠️ Tên danh mục không được để trống.");
          return;
        }

        const updatedFields: UpdateCategoryPostDto = {
          name: formData.name.trim(),
        };

        // Luôn gửi giá trị parent rõ ràng, không dùng undefined
        updatedFields.parent = parentValue ?? undefined;

        // Nếu không có gì thay đổi thì không gửi lên
        if (
          updatedFields.name === currentCategory.name &&
          ((updatedFields.parent === null && !currentCategory.parent) ||
            updatedFields.parent === currentCategory.parent)
        ) {
          alert("⚠️ Không có thay đổi nào.");
          return;
        }

        console.log("updatedFields", updatedFields);
        await updateMutation.mutateAsync({ slug: slug!, data: updatedFields });
        alert("✅ Cập nhật thành công!");
      } else {
        if (!formData.name?.trim()) {
          alert("⚠️ Tên danh mục không được để trống.");
          return;
        }

        await createMutation.mutateAsync({
          name: formData.name.trim(),
          parent: parentValue ?? undefined, // 👈 gửi null nếu là danh mục cha
        });
        alert("✅ Tạo mới thành công!");
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      alert("❌ Có lỗi xảy ra.");
    }
  };

  // ✅ Danh mục cha dạng cây (loại chính nó)
  const parentOptions = useMemo(() => {
    if (!allCategories?.length) return [];

    const mapChildren = (
      parent: CategoryPost,
      level = 0
    ): { value: string; label: string }[] => {
      const children = allCategories.filter((cat) => cat.parent === parent._id);
      const result = [
        {
          value: parent._id,
          label: `${"— ".repeat(level)}${parent.name}`,
        },
      ];
      children.forEach((child) => {
        result.push(...mapChildren(child, level + 1));
      });
      return result;
    };

    const topLevel = allCategories.filter((cat) => !cat.parent);
    const nested = topLevel.flatMap((cat) => mapChildren(cat));
    return nested.filter((opt) => opt.value !== currentCategory?._id);
  }, [allCategories, currentCategory]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">
        {isEditMode ? "✏️ Cập nhật danh mục" : "➕ Thêm danh mục mới"}
      </h2>

      {/* Tên danh mục */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tên danh mục <span className="text-red-500">*</span>
        </label>
        <input
          {...register("name", { required: true })}
          type="text"
          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          placeholder="VD: Trang Trí Nhà Cửa"
        />
      </div>

      {/* Danh mục cha */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Danh mục cha
        </label>
        <select
          {...register("parent")}
          className="w-full px-3 py-2 border rounded bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">— Không chọn —</option>
          {parentOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Nút hành động */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.push("/admin/categories-post")}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          ❌ Huỷ
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isEditMode ? "💾 Cập nhật" : "📥 Tạo mới"}
        </button>
      </div>
    </form>
  );
};

export default CategoriesPostForm;
