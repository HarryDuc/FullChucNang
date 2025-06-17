'use client'

import { useState, useEffect } from 'react';
import { ContactListService, IContactList } from '../services/info-website.service';
export const useInfoWebsite = () => {
  const [contact, setContact] = useState<IContactList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveContact = async () => {
      try {
        const data = await ContactListService.getActive();
        setContact(Array.isArray(data) ? data[0] : data);
      } catch (err) {
        setError('Failed to fetch contact information');
        console.error('Error fetching contact:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveContact();
  }, []);

  return {
    contact,
    loading,
    error
  };
};