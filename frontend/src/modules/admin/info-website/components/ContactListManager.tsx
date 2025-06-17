import { useState, useEffect } from 'react';
import { useContactList } from '../hooks/useContactList';
import { IContactList } from '../services/contact-list.service';
import ContactListTable from './ContactListTable';
import ContactListForm from './ContactListForm';

const ContactListManager = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<IContactList | null>(null);
  const { contacts, loading, fetchContacts, createContact, updateContact, deleteContact } = useContactList();

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleCreate = async (data: Omit<IContactList, '_id' | 'createdAt' | 'updatedAt'>) => {
    await createContact(data);
    setIsFormOpen(false);
  };

  const handleUpdate = async (data: Omit<IContactList, '_id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingContact) return;
    await updateContact(editingContact._id, data);
    setEditingContact(null);
    setIsFormOpen(false);
  };

  const handleEdit = (contact: IContactList) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      await deleteContact(id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingContact(null);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Thông tin liên hệ</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          Thêm thông tin liên hệ
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <ContactListTable
          contacts={contacts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {isFormOpen && (
        <ContactListForm
          contact={editingContact}
          onSubmit={editingContact ? handleUpdate : handleCreate}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default ContactListManager;
