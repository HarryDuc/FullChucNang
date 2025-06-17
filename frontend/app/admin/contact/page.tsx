import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";
import ContactList from "@/modules/admin/contact/components/ContactList";

export default function ContactPage() {
  return (
    <LayoutAdmin>
      <ContactList />
    </LayoutAdmin>
  );
}