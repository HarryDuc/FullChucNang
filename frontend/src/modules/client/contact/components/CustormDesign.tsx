"use client";

import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Phone,
  Mail,
  ArrowRight,
  CheckCircle,
  LayoutDashboard,
  Settings,
  Users,
  Heart,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { useContactForm } from "../hooks/useContactForm";

const CustormDesign = () => {
  const leftSectionRef = useRef<HTMLDivElement>(null);
  const rightSectionRef = useRef<HTMLDivElement>(null);
  const templatesSectionRef = useRef<HTMLDivElement>(null);
  const [activeTemplate, setActiveTemplate] = useState(0);
  const { handleSubmit, isLoading } = useContactForm();
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    customerEmail: "",
    content: "",
    projectTitle: "Thiệp cưới điện tử",
    sendNotificationToAdmin: false,
    sendConfirmationToCustomer: false,
  });

  useEffect(() => {
    const leftSection = leftSectionRef.current;
    const rightSection = rightSectionRef.current;
    const templatesSection = templatesSectionRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === leftSection) {
              leftSection?.classList.add("visible-left");
            }
            if (entry.target === rightSection) {
              rightSection?.classList.add("visible-right");
            }
            if (entry.target === templatesSection) {
              templatesSection?.classList.add("visible-templates");
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (leftSection) observer.observe(leftSection);
    if (rightSection) observer.observe(rightSection);
    if (templatesSection) observer.observe(templatesSection);

    // Auto rotate templates
    const interval = setInterval(() => {
      setActiveTemplate((prev) => (prev + 1) % 6);
    }, 3000);

    return () => {
      if (leftSection) observer.unobserve(leftSection);
      if (rightSection) observer.unobserve(rightSection);
      if (templatesSection) observer.unobserve(templatesSection);
      clearInterval(interval);
    };
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleSubmit(formData);
    if (success) {
      toast.success(
        "Gửi yêu cầu tư vấn thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      setFormData({
        fullName: "",
        phoneNumber: "",
        customerEmail: "",
        content: "",
        projectTitle: "Thiệp cưới điện tử",
        sendNotificationToAdmin: false,
        sendConfirmationToCustomer: false,
      });
    } else {
      toast.error("Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50 relative overflow-hidden">
      <ToastContainer />
      {/* Hero Section */}
      <div className="relative z-10 pt-10 md:pt-20">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 relative overflow-hidden">
          <div className="relative">
            <div className="text-center mb-8">
              <div className="inline-block p-2 bg-rose-50 rounded-full mb-3">
                <MessageSquare className="w-6 h-6 text-rose-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Đăng ký tư vấn trực tuyến
              </h2>
              <p className="text-gray-500 mt-2">
                Nhận tư vấn miễn phí từ chuyên gia
              </p>

              <div className="flex justify-center mt-4">
                <div className="h-px w-16 bg-rose-200"></div>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleFormSubmit}>
              <div className="group">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Họ và Tên
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-rose-500 focus:ring focus:ring-rose-200 transition-all outline-none"
                    placeholder="Nhập họ và tên của bạn"
                  />
                </div>
              </div>

              <div className="group">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Số điện thoại
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-rose-500 focus:ring focus:ring-rose-200 transition-all outline-none"
                    placeholder="Nhập số điện thoại của bạn"
                  />
                </div>
              </div>

              <div className="group">
                <label
                  htmlFor="customerEmail"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="customerEmail"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-rose-500 focus:ring focus:ring-rose-200 transition-all outline-none"
                    placeholder="Nhập email của bạn (không bắt buộc)"
                  />
                </div>
              </div>

              <div className="group">
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nội dung
                </label>
                <div className="relative">
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-rose-500 focus:ring focus:ring-rose-200 transition-all outline-none"
                    placeholder="Nhập nội dung bạn muốn tư vấn"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:from-rose-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Đang gửi...</span>
                ) : (
                  <>
                    <span>Gửi yêu cầu tư vấn</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustormDesign;
