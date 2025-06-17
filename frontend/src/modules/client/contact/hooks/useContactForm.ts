import { useState } from 'react';
import { contactService, ICreateContact } from '../services/contact.service';
import { toast } from 'react-hot-toast';

export const useContactForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ICreateContact) => {
    try {
      setIsLoading(true);
      await contactService.create(data);
      toast.success('Gửi thông tin thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
      return true;
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau!');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSubmit,
  };
};