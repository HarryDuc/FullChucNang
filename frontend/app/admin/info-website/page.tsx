'use client';

import LayoutAdmin from '@/modules/admin/common/layouts/AdminLayout';
import ContactListManager from '@/modules/admin/info-website/components/ContactListManager';

const ContactListPage = () => {
  return (
    <LayoutAdmin>
      <ContactListManager />
    </LayoutAdmin>
  );
};

export default ContactListPage;