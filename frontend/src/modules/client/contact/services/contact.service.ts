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

import { config } from "@/config/config";
import { API_URL_CLIENT } from "@/config/apiRoutes";
const API_URL = API_URL_CLIENT + config.ROUTES.CONTACTS.BASE;

export const contactService = {
  create: async (data: ICreateContact) => {
    const response = await axios.post(`${API_URL}`, data);
    return response.data;
  },
};