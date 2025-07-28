import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch, Control } from 'react-hook-form';
import { ISpecification, ICreateSpecification } from '../models/specification.model';
import { ClientCategoryService } from '@/common/services/client.product.category.service';
import CategoryTree, { Category } from './CategoryTree';
import SunEditerForSpecification from '../../common/components/SunEditerForSpecification';

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
                {...register(`groups.${groupIndex}.specs.${index}.name` as const, { required: 'Tên thông số kỹ thuật là bắt buộc' })}
                placeholder="Tên thông số kỹ thuật"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input
                type="text"
                {...register(`groups.${groupIndex}.specs.${index}.value` as const)}
                placeholder="Giá trị thông số kỹ thuật (không bắt buộc)"
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
    defaultValues: initialData ? {
      ...initialData,
      // Convert boolean to string for radio buttons
      isSpecification: initialData.isSpecification ? 'true' : 'false'
    } : {
      name: '',
      slug: '',
      title: '',
      groups: [{ 
        title: '', 
        specs: [{ name: '', value: '' }]
      }],
      categories: [],
      isActive: true,
      displayOrder: 0,
      isSpecification: 'false',
      isSpecificationProduct: ''
    },
    mode: 'onChange'
  });

  // Watch name field for auto-generating slug
  const name = useWatch({
    control,
    name: 'name'
  });

  // Watch isSpecification field to show/hide appropriate sections
  const isSpecification = useWatch({
    control,
    name: 'isSpecification'
  });

  // Convert to boolean for comparison (handle both string and boolean types)
  const isSpecificationBoolean = isSpecification === 'true' || isSpecification === true;

  // Auto-generate slug when name changes in create mode
  useEffect(() => {
    if (mode === 'create' && name) {
      setValue('slug', generateSlug(name));
    }
  }, [mode, name, setValue]);

  // Custom validation for isSpecificationProduct
  useEffect(() => {
    if (isSpecificationBoolean) {
      const currentValue = getValues('isSpecificationProduct');
      if (!currentValue || currentValue.trim() === '') {
        setValue('isSpecificationProduct', '', { shouldValidate: true });
      }
    }
  }, [isSpecificationBoolean, getValues, setValue]);

  const { fields: groupFields, append: appendGroup, remove: removeGroup } = useFieldArray({
    control,
    name: 'groups'
  });

  // Handle form submission with custom validation
  const handleFormSubmit = (data: ICreateSpecification) => {
    // Convert to boolean for validation (handle both string and boolean types)
    const isSpecificationValue = data.isSpecification === 'true' || data.isSpecification === true;
    
    // Custom validation for isSpecificationProduct
    if (isSpecificationValue && (!data.isSpecificationProduct || data.isSpecificationProduct.trim() === '')) {
      setValue('isSpecificationProduct', '', { shouldValidate: true });
      return;
    }

    // Custom validation for groups when isSpecification is false
    if (!isSpecificationValue && (!data.groups || data.groups.length === 0)) {
      return;
    }

    // Validate that groups have at least one group with title and specs
    if (!isSpecificationValue && data.groups) {
      const validGroups = data.groups.filter(group => 
        group.title && group.title.trim() !== '' && 
        group.specs && group.specs.length > 0 &&
        group.specs.some(spec => spec.name && spec.name.trim() !== '')
      );
      
      if (validGroups.length === 0) {
        return;
      }
    }

    // Prepare data for submission
    const submitData: any = {
      ...data,
      isSpecification: isSpecificationValue,
      // Ensure proper data types
      isActive: typeof data.isActive === 'boolean' ? data.isActive : data.isActive === 'true',
      displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : parseInt(String(data.displayOrder)) || 0,
      // Ensure categories is an array of strings
      categories: Array.isArray(data.categories) ? data.categories : []
    };

    // Remove groups if isSpecification is true
    if (isSpecificationValue) {
      delete submitData.groups;
    } else {
      // Ensure groups is properly formatted when isSpecification is false
      if (data.groups && Array.isArray(data.groups)) {
        submitData.groups = data.groups.filter(group => 
          group.title && group.title.trim() !== '' && 
          group.specs && group.specs.length > 0 &&
          group.specs.some(spec => spec.name && spec.name.trim() !== '')
        );
      }
    }

    // Remove isSpecificationProduct if isSpecification is false
    if (!isSpecificationValue) {
      delete submitData.isSpecificationProduct;
    }

    console.log('Submitting data:', submitData);
    onSubmit(submitData);
  };

  // Handle checkbox change for categories
  const handleCategoryChange = (category: Category, checked: boolean) => {
    const current = getValues('categories') || [];
    let updated: string[];
    
    if (checked) {
      // Chỉ thêm danh mục được chọn, không tự động thêm danh mục cha
      if (!current.includes(category._id)) {
        updated = [...current, category._id];
      } else {
        updated = current;
      }
    } else {
      // Chỉ xóa danh mục được bỏ chọn, không tự động xóa danh mục con
      updated = current.filter(id => id !== category._id);
    }
    
    setValue('categories', updated, { shouldValidate: true });
  };

  // Watch categories for validation
  const selectedCategories = useWatch({ control, name: 'categories' }) || [];

  // Đưa phần "Gán cho danh mục" sang bên phải, tỉ lệ 6:4
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
            <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
            <input
              type="text"
              {...register('title', { required: 'Tiêu đề là bắt buộc' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          {/* Loại thông số kỹ thuật */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại thông số kỹ thuật
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  {...register('isSpecification', { 
                    required: 'Vui lòng chọn loại thông số kỹ thuật',
                    validate: (value) => {
                      if (value === undefined || value === null) {
                        return 'Vui lòng chọn loại thông số kỹ thuật';
                      }
                      return true;
                    }
                  })}
                  value="false"
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Nhập thông số kỹ thuật theo nhóm</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  {...register('isSpecification')}
                  value="true"
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Nhập mô tả thông số kỹ thuật</span>
              </label>
            </div>
            {errors.isSpecification && <p className="mt-1 text-sm text-red-600">{errors.isSpecification.message}</p>}
          </div>

          {/* Hiển thị phần nhập thông số kỹ thuật theo nhóm */}
          {!isSpecificationBoolean && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nhóm thông số kỹ thuật
                <span className="text-red-500 ml-1">*</span>
              </label>
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
              {groupFields.length === 0 && (
                <p className="mt-1 text-sm text-red-600">Ít nhất phải có một nhóm thông số kỹ thuật</p>
              )}
            </div>
          )}

          {/* Hiển thị phần nhập mô tả thông số kỹ thuật */}
          {isSpecificationBoolean && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mô tả thông số kỹ thuật
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="mt-1">
                <SunEditerForSpecification
                  postData={getValues('isSpecificationProduct') || ''}
                  setPostData={(value) => {
                    setValue('isSpecificationProduct', value, { 
                      shouldValidate: true,
                      shouldDirty: true 
                    });
                  }}
                />
                <input
                  type="hidden"
                  {...register('isSpecificationProduct', {
                    validate: (value) => {
                      if (isSpecificationBoolean && (!value || value.trim() === '')) {
                        return 'Mô tả thông số kỹ thuật là bắt buộc';
                      }
                      return true;
                    }
                  })}
                />
              </div>
              {errors.isSpecificationProduct && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.isSpecificationProduct.message || 'Mô tả thông số kỹ thuật là bắt buộc'}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Thứ tự</label>
              <input
                type="number"
                {...register('displayOrder', {
                  setValueAs: (value) => parseInt(value) || 0
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
              <select
                {...register('isActive', {
                  setValueAs: (value) => value === 'true'
                })}
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