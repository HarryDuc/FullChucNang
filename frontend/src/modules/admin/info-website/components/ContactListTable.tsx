import { IContactList } from '../services/contact-list.service';

interface ContactListTableProps {
  contacts: IContactList[];
  onEdit: (contact: IContactList) => void;
  onDelete: (id: string) => void;
}

const ContactListTable = ({ contacts, onEdit, onDelete }: ContactListTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-4 py-2">Status</th>
            <th className="border border-gray-200 px-4 py-2">Phone</th>
            <th className="border border-gray-200 px-4 py-2">Email</th>
            <th className="border border-gray-200 px-4 py-2">Address</th>
            <th className="border border-gray-200 px-4 py-2">Social Media</th>
            <th className="border border-gray-200 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact._id} className="hover:bg-gray-50">
              <td className="border border-gray-200 px-4 py-2">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={contact.isActive}
                    disabled
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>
              </td>
              <td className="border border-gray-200 px-4 py-2">
                <div className="space-y-1">
                  {contact.phone && <div>Phone: {contact.phone}</div>}
                  {contact.hotline && <div>Hotline: {contact.hotline}</div>}
                </div>
              </td>
              <td className="border border-gray-200 px-4 py-2">{contact.email}</td>
              <td className="border border-gray-200 px-4 py-2">{contact.address}</td>
              <td className="border border-gray-200 px-4 py-2">
                <div className="space-y-1">
                  {contact.facebook && (
                    <div>Facebook: {contact.facebook}</div>
                  )}
                  {contact.zalo && <div>Zalo: {contact.zalo}</div>}
                  {contact.whatsapp && (
                    <div>WhatsApp: {contact.whatsapp}</div>
                  )}
                  {contact.telegram && (
                    <div>Telegram: {contact.telegram}</div>
                  )}
                  {contact.twitter && (
                    <div>Twitter: {contact.twitter}</div>
                  )}
                  {contact.instagram && (
                    <div>Instagram: {contact.instagram}</div>
                  )}
                </div>
              </td>
              <td className="border border-gray-200 px-4 py-2">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit(contact)}
                    className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(contact._id)}
                    className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContactListTable;