import { useState, useCallback } from 'react';
import { contactService, IContact } from '../services/contact.service';
import { toast } from 'react-toastify';

export const useContact = () => {
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<IContact | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await contactService.getAllContacts();
      setContacts(data);
    } catch (err) {
      setError('Có lỗi xảy ra khi tải danh sách liên hệ');
      toast.error('Có lỗi xảy ra khi tải danh sách liên hệ');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchContactById = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await contactService.getContactById(id);
      setSelectedContact(data);
      return data;
    } catch (err) {
      setError('Có lỗi xảy ra khi tải thông tin liên hệ');
      toast.error('Có lỗi xảy ra khi tải thông tin liên hệ');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteContact = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await contactService.deleteContact(id);
      setContacts(prev => prev.filter(contact => contact._id !== id));
      toast.success('Xóa liên hệ thành công');
      return true;
    } catch (err) {
      setError('Có lỗi xảy ra khi xóa liên hệ');
      toast.error('Có lỗi xảy ra khi xóa liên hệ');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    contacts,
    selectedContact,
    isLoading,
    error,
    fetchContacts,
    fetchContactById,
    deleteContact,
  };
};