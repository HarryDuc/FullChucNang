import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCategoriesProduct } from "../services/categories-product.service";
import { CategoriesProduct } from "../types/categories-product.types";

interface Props {
  category?: CategoriesProduct;
  onSuccess: (data: {
    name: string;
    description?: string;
    parentCategory?: string;
  }) => void;
}

const CategoriesProductForm: React.FC<Props> = ({ category, onSuccess }) => {
  const router = useRouter();
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [parentCategory, setParentCategory] = useState(
    category?.parentCategory || ""
  );
  const [categories, setCategories] = useState<CategoriesProduct[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategoriesProduct();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const categoryData = {
      name,
      description,
      parentCategory: parentCategory || undefined,
    };
    onSuccess(categoryData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col">
        <label htmlFor="name" className="mb-1 text-gray-700 font-medium">
          Tên danh mục
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên danh mục"
          required
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="description" className="mb-1 text-gray-700 font-medium">
          Mô tả danh mục
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả danh mục"
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="parentCategory"
          className="mb-1 text-gray-700 font-medium"
        >
          Chọn danh mục cha (nếu có)
        </label>
        <select
          id="parentCategory"
          value={parentCategory}
          onChange={(e) => setParentCategory(e.target.value)}
          className="p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 max-h-60 overflow-y-auto"
        >
          <option value="">Chọn danh mục cha (nếu có)</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded transition-colors"
        >
          {category ? "Cập nhật" : "Tạo danh mục"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/categories-product")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded transition-colors"
        >
          Quay lại danh sách danh mục
        </button>
      </div>
    </form>
  );
};

export default CategoriesProductForm;
