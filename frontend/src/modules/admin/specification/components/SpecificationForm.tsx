import React, { useEffect } from 'react';
import { useForm, useFieldArray, useWatch, Control } from 'react-hook-form';
import { ISpecification, ICreateSpecification } from '../models/specification.model';

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
          {...register(`groups.${groupIndex}.title` as const, { required: 'Group title is required' })}
          placeholder="Group Title"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={onRemove}
          className="ml-2 text-red-600 hover:text-red-800"
        >
          Remove Group
        </button>
      </div>

      {/* Specs Section */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Specifications</label>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input
                type="text"
                {...register(`groups.${groupIndex}.specs.${index}.name` as const, { required: true })}
                placeholder="Spec Name"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input
                type="text"
                {...register(`groups.${groupIndex}.specs.${index}.value` as const, { required: true })}
                placeholder="Spec Value"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ name: '', value: '' })}
            className="mt-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Add Specification
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
  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<ICreateSpecification>({
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            {...register('name', { required: 'Name is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Slug</label>
          <input
            type="text"
            {...register('slug', { required: 'Slug is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            readOnly={mode === 'create'}
          />
          {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
          {mode === 'create' && (
            <p className="mt-1 text-sm text-gray-500">Slug will be auto-generated from name</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          {...register('title', { required: 'Title is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Groups</label>
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
          Add Group
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Display Order</label>
          <input
            type="number"
            {...register('displayOrder')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            {...register('isActive')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Specification' : 'Update Specification'}
        </button>
      </div>
    </form>
  );
}; 