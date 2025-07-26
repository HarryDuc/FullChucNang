import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch, Control } from 'react-hook-form';
import { ISpecification, ICreateSpecification } from '../models/specification.model';
import { ClientCategoryService } from '@/common/services/client.product.category.service';
import CategoryTree, { Category } from './CategoryTree';

interface CategoryOption {
  _id: string;
  name: string;
}

interface SpecificationFormProps {
  initialData?: ISpecification;
  onSubmit: (data: ICreateSpecification) => void;
  loading: boolean;
  mode: 'create' | 'edit';
}

interface GroupFieldProps {
  control: Control<ICreateSpecification>;
  register: any;
  groupIndex: number;
  onRemove: () => void;
}

const GroupField: React.FC<GroupFieldProps> = ({
  control,
  register,
  groupIndex,
  onRemove
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `groups.${groupIndex}.specs` as const
  });

  return (
    <div className="mt-4 p-4 border rounded-md">
      <div className="flex justify-between items-center mb-2">
        <input
          type="text"
          {...register(`groups.${groupIndex}.title` as const, { required: 'Nhóm thông số kỹ thuật là bắt buộc' })}
          placeholder="Group Title"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={onRemove}
          className="ml-2 text-red-600 hover:text-red-800"
        >
          Xóa nhóm
        </button>
      </div>

      {/* Specs Section */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Thông số kỹ thuật</label>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input
                type="text"
                {...register(`groups.${groupIndex}.specs.${index}.name` as const, { required: true })}
                placeholder="Tên thông số kỹ thuật"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input
                type="text"
                {...register(`groups.${groupIndex}.specs.${index}.value` as const, { required: true })}
                placeholder="Giá trị thông số kỹ thuật"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-600 hover:text-red-800"
              >
                Xóa
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ name: '', value: '' })}
            className="mt-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Thêm thông số kỹ thuật
          </button>
        </div>
      </div>
    </div>
  );
};

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const SpecificationForm: React.FC<SpecificationFormProps> = ({
  initialData,
  onSubmit,
  loading,
  mode
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(false);

  useEffect(() => {
    setCatLoading(true);
    ClientCategoryService.getAllCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch(() => setCategories([]))
      .finally(() => setCatLoading(false));
  }, []);

  const { register, control, handleSubmit, setValue, getValues, formState: { errors } } = useForm<ICreateSpecification>({
    defaultValues: initialData || {
      name: '',
      slug: '',
      title: '',
      groups: [{ 
        title: '', 
        specs: [{ name: '', value: '' }]
      }],
      categories: [],
      isActive: true,
      displayOrder: 0
    }
  });

  // Watch name field for auto-generating slug
  const name = useWatch({
    control,
    name: 'name'
  });

  // Auto-generate slug when name changes in create mode
  useEffect(() => {
    if (mode === 'create' && name) {
      setValue('slug', generateSlug(name));
    }
  }, [mode, name, setValue]);

  const { fields: groupFields, append: appendGroup, remove: removeGroup } = useFieldArray({
    control,
    name: 'groups'
  });

  // Handle checkbox change for categories
  const handleCategoryChange = (category: Category, checked: boolean) => {
    const current = getValues('categories') || [];
    let updated: string[];
    
    if (checked) {
      // Khi chọn danh mục con, tự động chọn tất cả danh mục cha
      const getAllParentCategories = (childCategory: Category): string[] => {
        if (!childCategory.parentCategory) {
          return [];
        }
        
        const parentCategory = categories.find(cat => cat._id === childCategory.parentCategory);
        if (!parentCategory) {
          return [];
        }
        
        // Đệ quy để lấy tất cả danh mục cha của cha
        return [parentCategory._id, ...getAllParentCategories(parentCategory)];
      };
      
      const parentCategoriesToAdd = getAllParentCategories(category);
      const categoriesToAdd = [category._id, ...parentCategoriesToAdd];
      
      // Thêm tất cả danh mục mới (tránh trùng lặp)
      const newCategories = [...current];
      categoriesToAdd.forEach(catId => {
        if (!newCategories.includes(catId)) {
          newCategories.push(catId);
        }
      });
      
      updated = newCategories;
    } else {
      // Khi bỏ chọn danh mục cha, cũng bỏ chọn tất cả danh mục con
      const getAllChildCategories = (parentCategory: Category): string[] => {
        const children = categories.filter(cat => cat.parentCategory === parentCategory._id);
        let allChildren: string[] = [];
        
        for (const child of children) {
          allChildren.push(child._id);
          // Đệ quy để lấy tất cả danh mục con của con
          allChildren = [...allChildren, ...getAllChildCategories(child)];
        }
        
        return allChildren;
      };
      
      const childCategoriesToRemove = getAllChildCategories(category);
      const categoriesToRemove = [category._id, ...childCategoriesToRemove];
      
      updated = current.filter(id => !categoriesToRemove.includes(id));
    }
    
    setValue('categories', updated, { shouldValidate: true });
  };

  // Watch categories for validation
  const selectedCategories = useWatch({ control, name: 'categories' }) || [];

  // Đưa phần "Gán cho danh mục" sang bên phải, tỉ lệ 6:4
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Grid chia 2 cột, trái 6, phải 4 */}
      <div className="grid grid-cols-10 gap-6">
        {/* Cột trái: Thông tin chính, chiếm 6/10 */}
        <div className="col-span-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên thông số kỹ thuật</label>
              <input
                type="text"
                {...register('name', { required: 'Tên thông số kỹ thuật là bắt buộc' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <input
                type="text" 
                {...register('slug', { required: 'Slug là bắt buộc' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                readOnly={mode === 'create'}
              />
              {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
              {mode === 'create' && (
                <p className="mt-1 text-sm text-gray-500">Slug sẽ được tự động tạo từ tên</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nhóm thông số kỹ thuật</label>
            {groupFields.map((field, index) => (
              <GroupField
                key={field.id}
                control={control}
                register={register}
                groupIndex={index}
                onRemove={() => removeGroup(index)}
              />
            ))}
            <button
              type="button"
              onClick={() => appendGroup({ 
                title: '', 
                specs: [{ name: '', value: '' }]
              })}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Thêm nhóm
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Thứ tự</label>
              <input
                type="number"
                {...register('displayOrder')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
              <select
                {...register('isActive')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="true">Hoạt động</option>
                <option value="false">Không hoạt động</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cột phải: Gán cho danh mục, chiếm 4/10 */}
        <div className="col-span-4">
          <label className="block text-sm font-medium text-gray-700">Gán cho danh mục</label>
          <div>
            {catLoading ? (
              <span className="col-span-6">Đang tải danh mục...</span>
            ) : categories.length === 0 ? (
              <span className="col-span-6">Không có danh mục</span>
            ) : (
              <CategoryTree
                categories={categories}
                selectedCategoryNames={selectedCategories}
                handleCategoryChange={handleCategoryChange}
              />
            )}
          </div>
          {errors.categories && <p className="mt-1 text-sm text-red-600">{errors.categories.message as string}</p>}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {loading ? 'Đang lưu...' : mode === 'create' ? 'Tạo thông số kỹ thuật' : 'Cập nhật thông số kỹ thuật'}
        </button>
      </div>
    </form>
  );
}; 