import axios from 'axios';

export interface ICreateContact {
  projectTitle?: string;
  fullName: string;
  phoneNumber: string;
  content: string;
  sendNotificationToAdmin?: boolean;
  sendConfirmationToCustomer?: boolean;
  customerEmail?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const contactService = {
  create: async (data: ICreateContact) => {
    const response = await axios.post(`${API_URL}/contactsapi`, data);
    return response.data;
  },
};