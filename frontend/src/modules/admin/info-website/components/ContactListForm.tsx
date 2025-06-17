import { useForm } from "react-hook-form";
import { IContactList } from "../services/contact-list.service";

interface ContactListFormProps {
  contact?: IContactList | null;
  onSubmit: (
    data: Omit<IContactList, "_id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  onClose: () => void;
}

const ContactListForm = ({
  contact,
  onSubmit,
  onClose,
}: ContactListFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      logo: contact?.logo,
      map: contact?.map,
      favicon: contact?.favicon,
      facebook: contact?.facebook,
      name: contact?.name,
      mst: contact?.mst,
      date_start: contact?.date_start,
      company_name: contact?.company_name,
      youtube: contact?.youtube,
      phone: contact?.phone,
      website: contact?.website,
      zalo: contact?.zalo,
      whatsapp: contact?.whatsapp,
      hotline: contact?.hotline,
      twitter: contact?.twitter,
      telegram: contact?.telegram,
      instagram: contact?.instagram,
      email: contact?.email,
      address: contact?.address,
      description: contact?.description,
      isActive: contact?.isActive ?? true,
    },
  });

  const onFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error("Failed to submit form:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-3xl rounded-lg bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {contact
              ? "Edit Contact Information"
              : "Add New Contact Information"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 overflow-y-auto max-h-[80vh]">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="logo"
                className="block text-sm font-medium text-gray-700"
              >
                Logo
              </label>
              <input
                id="logo"
                type="text"
                {...register("logo")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="company_name"
                className="block text-sm font-medium text-gray-700"
              >
                Company Name
              </label>
              <input
                id="company_name"
                type="text"
                {...register("company_name")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="mst"
                className="block text-sm font-medium text-gray-700"
              >
                MST
              </label>
              <input
                id="mst"
                type="text"
                {...register("mst")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="date_start"
                className="block text-sm font-medium text-gray-700"
              >
                Date Start
              </label>
              <input
                id="date_start"
                type="text"
                {...register("date_start")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="youtube"
                className="block text-sm font-medium text-gray-700"
              >
                Youtube
              </label>
              <input
                id="logo"
                type="text"
                {...register("logo")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="map"
                className="block text-sm font-medium text-gray-700"
              >
                Map
              </label>
              <input
                id="map"
                type="text"
                {...register("map")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="favicon"
                className="block text-sm font-medium text-gray-700"
              >
                Favicon
              </label>
              <input
                id="favicon"
                type="text"
                {...register("favicon")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone
              </label>
              <input
                id="phone"
                type="text"
                {...register("phone")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="hotline"
                className="block text-sm font-medium text-gray-700"
              >
                Hotline
              </label>
              <input
                id="hotline"
                type="text"
                {...register("hotline")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="website"
                className="block text-sm font-medium text-gray-700"
              >
                Website
              </label>
              <input
                id="website"
                type="text"
                {...register("website")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <input
              id="address"
              type="text"
              {...register("address")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="facebook"
                className="block text-sm font-medium text-gray-700"
              >
                Facebook
              </label>
              <input
                id="facebook"
                type="text"
                {...register("facebook")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="zalo"
                className="block text-sm font-medium text-gray-700"
              >
                Zalo
              </label>
              <input
                id="zalo"
                type="text"
                {...register("zalo")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="whatsapp"
                className="block text-sm font-medium text-gray-700"
              >
                WhatsApp
              </label>
              <input
                id="whatsapp"
                type="text"
                {...register("whatsapp")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="telegram"
                className="block text-sm font-medium text-gray-700"
              >
                Telegram
              </label>
              <input
                id="telegram"
                type="text"
                {...register("telegram")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="twitter"
                className="block text-sm font-medium text-gray-700"
              >
                Twitter
              </label>
              <input
                id="twitter"
                type="text"
                {...register("twitter")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="instagram"
                className="block text-sm font-medium text-gray-700"
              >
                Instagram
              </label>
              <input
                id="instagram"
                type="text"
                {...register("instagram")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <input
              id="description"
              type="text"
              {...register("description")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              {...register("isActive")}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-gray-700"
            >
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              {contact ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactListForm;
