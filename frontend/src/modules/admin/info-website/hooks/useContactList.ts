import { useState, useCallback } from 'react';
import { ContactListService, IContactList, CreateContactListDto, UpdateContactListDto } from '../services/contact-list.service';
import toast from 'react-hot-toast';

export const useContactList = () => {
  const [contacts, setContacts] = useState<IContactList[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ContactListService.getAll();
      setContacts(data);
    } catch (err) {
      setError('Failed to fetch contacts');
      toast.error('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActiveContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ContactListService.getActive();
      setContacts(data);
    } catch (err) {
      setError('Failed to fetch active contacts');
      toast.error('Failed to fetch active contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  const createContact = useCallback(async (createDto: CreateContactListDto) => {
    try {
      setLoading(true);
      setError(null);
      const newContact = await ContactListService.create(createDto);
      setContacts(prev => [...prev, newContact]);
      toast.success('Contact created successfully');
      return newContact;
    } catch (err) {
      setError('Failed to create contact');
      toast.error('Failed to create contact');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateContact = useCallback(async (id: string, updateDto: UpdateContactListDto) => {
    try {
      setLoading(true);
      setError(null);
      const updatedContact = await ContactListService.update(id, updateDto);
      setContacts(prev => prev.map(contact =>
        contact._id === id ? updatedContact : contact
      ));
      toast.success('Contact updated successfully');
      return updatedContact;
    } catch (err) {
      setError('Failed to update contact');
      toast.error('Failed to update contact');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteContact = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await ContactListService.delete(id);
      setContacts(prev => prev.filter(contact => contact._id !== id));
      toast.success('Contact deleted successfully');
    } catch (err) {
      setError('Failed to delete contact');
      toast.error('Failed to delete contact');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    contacts,
    loading,
    error,
    fetchContacts,
    fetchActiveContacts,
    createContact,
    updateContact,
    deleteContact,
  };
};