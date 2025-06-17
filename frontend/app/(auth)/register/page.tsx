import RegisterForm from "@/modules/auth/pages/register";
import ClientLayout from "@/modules/client/common/layouts/ClientLayout";

export default function Page() {
  return (
    <ClientLayout>
      <RegisterForm />
    </ClientLayout>
  );
}
