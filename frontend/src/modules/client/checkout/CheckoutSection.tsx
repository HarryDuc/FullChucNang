"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import {
  CartItem as OriginalCartItem,
  getCart,
  clearCart,
  getCartTotal,
  listenCartChange,
} from "../../../../utils/cartUtils";
import { OrderService } from "./services/order.service";
import {
  createCheckout,
  updatePaymentStatus,
} from "./services/checkoutService";
import { paypalService } from "./services/paypalService";
import {
  Province,
  District,
  Ward,
  getAllProvinces,
  getDistrictsByProvinceCode,
  getWardsByDistrictCode,
} from "@/common/services/locationService";

import OrderSuccess from "./components/OrderSuccess";
import OrderSummary from "./components/OrderSummary";
import ShippingForm from "./components/ShippingForm";
import PaymentMethod from "./components/PaymentMethod";
import { UserService } from "../users/services/user.service";
import { User } from "../users/models/user.model";
import VoucherInput from "../voucher/components/VoucherInput";
import { Voucher } from "../voucher/models/voucher.model";
import PayPalButton from "./components/PayPalButton";
import MetaMaskButton from "./components/MetaMaskButton";
import { useAuth } from "@/context/AuthContext";
import router from "next/router";

// Interface cho dữ liệu tạo checkout dựa trên DTO trong backend
interface CreateCheckoutData {
  orderId: string;
  userId: string;
  email: string;
  orderCode: string;
  slug: string;
  name: string;
  phone: string;
  address: string;
  paymentMethod: "cash" | "payos" | "bank" | "paypal" | "metamask";
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethodInfo?: Record<string, any>;
}

// Định nghĩa lại interface CartItem để đảm bảo tương thích
type CartItem = OriginalCartItem;

interface ShippingInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  province: string | number;
  district: string | number;
  ward: string | number;
  note: string;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  province?: string;
  district?: string;
  ward?: string;
}

// Thêm hàm để lấy userId từ token
const getUserIdFromToken = (): string | null => {
  try {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("token");
    if (!token) return null;

    // Lấy phần payload của token (phần thứ 2 sau khi split bởi dấu chấm)
    const payload = token.split(".")[1];
    // Decode base64
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.userId;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

const CheckoutSection = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [showPayPalButton, setShowPayPalButton] = useState<boolean>(false);
  const [showMetaMaskButton, setShowMetaMaskButton] = useState<boolean>(false);
  const [isPayPalProcessing, setIsPayPalProcessing] = useState<boolean>(false);
  const [isMetaMaskProcessing, setIsMetaMaskProcessing] =
    useState<boolean>(false);
  const [payPalOrderRef, setPayPalOrderRef] = useState<string>("");
  const [metamaskOrderRef, setMetamaskOrderRef] = useState<string>("");
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated]);

  // Lấy thông tin profile từ API
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoadingProfile(false);
          return;
        }

        const profile = await UserService.getCurrentUser();
        console.log("Loaded user profile:", profile);
        setUserProfile(profile);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, []);

  // Lấy dữ liệu giỏ hàng từ localStorage khi component được mount
  useEffect(() => {
    const loadCart = () => {
      const cart = getCart();
      setCartItems(cart);
    };

    // Lấy giỏ hàng lần đầu
    loadCart();

    // Đăng ký lắng nghe sự thay đổi giỏ hàng
    const unsubscribe = listenCartChange(loadCart);

    // Tải dữ liệu tỉnh/thành phố
    const loadProvinces = async () => {
      try {
        const data = await getAllProvinces();
        setProvinces(data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu tỉnh/thành phố:", error);
      }
    };

    loadProvinces();

    // Hủy đăng ký khi component unmount
    return unsubscribe;
  }, []);

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    note: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");
  const [isOrderSent, setIsOrderSent] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderSlug, setOrderSlug] = useState<string>("");

  // Cập nhật thông tin shipping khi userProfile thay đổi
  useEffect(() => {
    if (userProfile) {
      console.log("Updating shipping info with user profile:", userProfile);
      setShippingInfo((prev) => ({
        ...prev,
        fullName: userProfile.fullName || prev.fullName,
        email: userProfile.email || prev.email,
        phone: userProfile.phone || prev.phone,
        address: userProfile.address || prev.address,
      }));
    }
  }, [userProfile]);

  // Tải dữ liệu quận/huyện khi chọn tỉnh/thành phố
  useEffect(() => {
    if (!shippingInfo.province) {
      setDistricts([]);
      return;
    }

    const loadDistricts = async () => {
      try {
        const data = await getDistrictsByProvinceCode(shippingInfo.province);
        setDistricts(data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu quận/huyện:", error);
      }
    };

    loadDistricts();
  }, [shippingInfo.province]);

  // Tải dữ liệu phường/xã khi chọn quận/huyện
  useEffect(() => {
    if (!shippingInfo.district) {
      setWards([]);
      return;
    }

    const loadWards = async () => {
      try {
        const data = await getWardsByDistrictCode(shippingInfo.district);
        setWards(data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu phường/xã:", error);
      }
    };

    loadWards();
  }, [shippingInfo.district]);

  // Update this effect to show/hide payment buttons based on payment method
  useEffect(() => {
    setShowPayPalButton(paymentMethod === "paypal");
    setShowMetaMaskButton(paymentMethod === "metamask");
  }, [paymentMethod]);

  const getSubtotal = () => {
    return getCartTotal(cartItems);
  };

  const getShippingFee = () => {
    return 0; // Miễn phí giao hàng
  };

  const getTotal = () => {
    return getSubtotal() + getShippingFee() - discountAmount;
  };

  const validateField = (
    name: string,
    value: string | number
  ): string | undefined => {
    const stringValue = String(value).trim();

    switch (name) {
      case "fullName":
        return !stringValue ? "Vui lòng nhập họ và tên" : undefined;
      case "phone":
        if (!stringValue) return "Vui lòng nhập số điện thoại";
        if (!/^\d{10,11}$/.test(stringValue))
          return "Số điện thoại phải có 10-11 chữ số";
        return undefined;
      case "email":
        if (!stringValue) return "Vui lòng nhập email";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue))
          return "Email không hợp lệ";
        return undefined;
      case "address":
        return !stringValue ? "Vui lòng nhập địa chỉ" : undefined;
      case "province":
        return !value ? "Vui lòng chọn tỉnh/thành phố" : undefined;
      case "district":
        return !value ? "Vui lòng chọn quận/huyện" : undefined;
      case "ward":
        return !value ? "Vui lòng chọn phường/xã" : undefined;
      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.entries(shippingInfo).forEach(([field, value]) => {
      if (field === "note") return;

      const fieldError = validateField(field, value);
      if (fieldError) {
        newErrors[field as keyof FormErrors] = fieldError;
        isValid = false;
      }
    });

    setErrors(newErrors);

    const allTouched: Record<string, boolean> = {};
    Object.keys(shippingInfo).forEach((field) => {
      if (field !== "note") {
        allTouched[field] = true;
      }
    });
    setTouched({ ...touched, ...allTouched });

    return isValid;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      setShippingInfo((prev) => ({
        ...prev,
        [name]: numericValue,
      }));

      if (touched[name]) {
        const fieldError = validateField(name, numericValue);
        setErrors((prev) => ({
          ...prev,
          [name]: fieldError,
        }));
      }
    } else {
      setShippingInfo((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (touched[name]) {
        const fieldError = validateField(name, value);
        setErrors((prev) => ({
          ...prev,
          [name]: fieldError,
        }));
      }
    }
  };

  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const fieldError = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  const handleLocationChange = (location: {
    province: string | number;
    district: string | number;
    ward: string | number;
  }) => {
    setShippingInfo((prev) => ({
      ...prev,
      province: location.province,
      district: location.district,
      ward: location.ward,
    }));

    if (touched.province) {
      setErrors((prev) => ({
        ...prev,
        province: validateField("province", location.province),
      }));
    }

    if (touched.district) {
      setErrors((prev) => ({
        ...prev,
        district: validateField("district", location.district),
      }));
    }

    if (touched.ward) {
      setErrors((prev) => ({
        ...prev,
        ward: validateField("ward", location.ward),
      }));
    }
  };

  const getLocationNames = () => {
    const provinceName =
      provinces.find((p) => p.code === shippingInfo.province)?.name || "";
    const districtName =
      districts.find((d) => d.code === shippingInfo.district)?.name || "";
    const wardName =
      wards.find((w) => w.code === shippingInfo.ward)?.name || "";

    return {
      provinceName,
      districtName,
      wardName,
    };
  };

  // Separate mappings for different APIs
  const getCheckoutPaymentMethod = (
    method: string
  ): "cash" | "payos" | "bank" | "paypal" | "metamask" => {
    const methodMap: Record<
      string,
      "cash" | "payos" | "bank" | "paypal" | "metamask"
    > = {
      cod: "cash",
      cash: "cash",
      bankTransfer: "bank",
      bank: "bank",
      paypal: "paypal",
      metamask: "metamask",
    };
    return methodMap[method] || "cash";
  };

  const getVoucherPaymentMethod = (method: string): string => {
    const methodMap: Record<string, string> = {
      cod: "COD",
      bankTransfer: "BANK",
      cash: "COD",
      paypal: "PAYPAL",
      metamask: "METAMASK",
    };
    return methodMap[method] || method.toUpperCase();
  };

  const handlePayPalSuccess = async (paypalOrderId: string) => {
    try {
      setIsPayPalProcessing(true);
      console.log("Processing PayPal payment success for order:", orderSlug);

      // Get auth token
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        throw new Error("Bạn cần đăng nhập để hoàn tất thanh toán");
      }

      // Update the order status to paid using the paypalService instead of direct API call
      console.log("Updating order status with PayPal ID:", paypalOrderId);
      await paypalService.updateOrderStatus(orderSlug, paypalOrderId);

      // Display success and clear cart
      console.log("Payment successful, clearing cart");
      setIsOrderSent(true);
      clearCart();
    } catch (error) {
      console.error("Error processing PayPal payment:", error);
      alert(
        "Đã xảy ra lỗi khi xử lý thanh toán PayPal. Vui lòng liên hệ hỗ trợ."
      );
    } finally {
      setIsPayPalProcessing(false);
    }
  };

  const handlePayPalError = (error: any) => {
    console.error("PayPal error:", error);
    alert(
      "Đã xảy ra lỗi với thanh toán PayPal. Vui lòng thử lại sau hoặc chọn phương thức thanh toán khác."
    );
    setIsPayPalProcessing(false);
  };

  const handlePayPalCancel = () => {
    alert(
      "Bạn đã hủy thanh toán PayPal. Vui lòng thử lại hoặc chọn phương thức thanh toán khác."
    );
    setIsPayPalProcessing(false);
  };

  const handleMetaMaskSuccess = async (transactionHash: string) => {
    try {
      setIsMetaMaskProcessing(true);
      console.log("Processing MetaMask payment success for order:", orderSlug);

      // Get auth token
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        throw new Error("Bạn cần đăng nhập để hoàn tất thanh toán");
      }

      // Payment status is already updated by the backend during transaction verification
      // No need to update it again here

      // Display success and clear cart
      console.log("Payment successful, clearing cart");
      setIsOrderSent(true);
      clearCart();
    } catch (error) {
      console.error("Error processing MetaMask payment:", error);
      alert(
        "Đã xảy ra lỗi khi xử lý thanh toán MetaMask. Vui lòng liên hệ hỗ trợ."
      );
    } finally {
      setIsMetaMaskProcessing(false);
    }
  };

  const handleMetaMaskError = (error: any) => {
    console.error("MetaMask error:", error);
    alert(
      "Đã xảy ra lỗi với thanh toán MetaMask. Vui lòng thử lại sau hoặc chọn phương thức thanh toán khác."
    );
    setIsMetaMaskProcessing(false);
  };

  const handleMetaMaskCancel = () => {
    alert(
      "Bạn đã hủy thanh toán MetaMask. Vui lòng thử lại hoặc chọn phương thức thanh toán khác."
    );
    setIsMetaMaskProcessing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const { provinceName, districtName, wardName } = getLocationNames();

    const orderItems = cartItems.map((item) => ({
      product: item._id,
      quantity: item.quantity,
      price: item.price,
      variant: item.variant,
      userId: getUserIdFromToken()!,
    }));

    const totalPrice = getTotal();
    const customerAddress = `${shippingInfo.address}, ${wardName}, ${districtName}, ${provinceName}`;

    try {
      console.log("Creating order...");
      const orderData = await OrderService.createOrder({
        orderItems,
        totalPrice,
        voucherId: appliedVoucher?._id,
        discountAmount: discountAmount,
      });
      console.log("Order created:", orderData);

      const slug = orderData.slug || "";
      setOrderSlug(slug);

      // Save the order reference for PayPal or MetaMask
      if (paymentMethod === "paypal") {
        setPayPalOrderRef(orderData._id || "");
      } else if (paymentMethod === "metamask") {
        setMetamaskOrderRef(orderData._id || "");
      }

      // Lấy userId từ token
      const userId = getUserIdFromToken();
      if (!userId) {
        throw new Error(
          "Không thể xác thực người dùng. Vui lòng đăng nhập lại."
        );
      }

      const checkoutData: CreateCheckoutData = {
        orderId: orderData._id!,
        userId: userId,
        email: shippingInfo.email,
        orderCode: orderData.slug || slug,
        slug: `${orderData.slug || slug}-payment`,
        name: shippingInfo.fullName,
        phone: shippingInfo.phone,
        address: customerAddress,
        paymentMethod: getCheckoutPaymentMethod(paymentMethod),
        paymentStatus: "pending",
        paymentMethodInfo: {},
      };

      console.log("Creating checkout with data:", checkoutData);
      const [res] = await Promise.all([
        createCheckout(checkoutData),
        Promise.resolve(slug),
      ]);
      console.log("Checkout response:", res);

      // Lưu thông tin đơn hàng vào localStorage
      const orderInfo = {
        items: cartItems,
        total: totalPrice,
        shipping: {
          name: shippingInfo.fullName,
          phone: shippingInfo.phone,
          address: customerAddress,
        },
      };
      console.log("Saving order info to localStorage:", orderInfo);

      localStorage.setItem("orderSlug", slug);
      localStorage.setItem("orderInfo", JSON.stringify(orderInfo));

      // For PayPal or MetaMask, we'll show the appropriate button and wait for user to complete payment
      if (paymentMethod === "paypal") {
        console.log("PayPal selected, showing PayPal button...");
        setShowPayPalButton(true);
        setIsSubmitting(false);
        return;
      }

      if (paymentMethod === "metamask") {
        console.log("MetaMask selected, showing MetaMask button...");
        setShowMetaMaskButton(true);
        setIsSubmitting(false);
        return;
      }

      if (paymentMethod === "bankTransfer") {
        console.log(
          "Bank transfer selected, QR URL:",
          res.paymentMethodInfo?.qrImageUrl
        );
        if (res.paymentMethodInfo?.qrImageUrl) {
          localStorage.setItem("qrUrl", res.paymentMethodInfo.qrImageUrl);
          console.log("Redirecting to bank page...");
          window.location.href = "/checkout/bank";
          return;
        } else {
          throw new Error("Không nhận được thông tin QR code");
        }
      }

      // Chỉ xóa giỏ hàng và hiển thị thành công nếu là COD
      console.log("COD payment, clearing cart...");
      setIsOrderSent(true);
      clearCart();
    } catch (error) {
      console.error("Error processing order:", error);
      alert("Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.");
    } finally {
      if (paymentMethod !== "paypal" && paymentMethod !== "metamask") {
        setIsSubmitting(false);
      }
    }
  };

  if (isOrderSent) {
    return <OrderSuccess orderSlug={orderSlug} />;
  }

  const shippingInfoForSummary = shippingInfo.province
    ? {
        fullName: shippingInfo.fullName,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        locationNames: getLocationNames(),
      }
    : undefined;

  return (
    <>
      <Head>
        <title>Checkout - Decor & More</title>
        <meta
          name="description"
          content="Tiến hành thanh toán đơn hàng của bạn tại Decor & More. Cập nhật thông tin giao hàng và phương thức thanh toán một cách nhanh chóng và an toàn."
        />
        <meta
          name="keywords"
          content="checkout, thanh toán, Decor & More, đơn hàng, mua sắm"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://decorandmore.vn/thanh-toan" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="checkout-page">
        <div className="mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold mb-6 text-blue-900 pb-2 border-b">
            THANH TOÁN
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {showPayPalButton && payPalOrderRef ? (
                <div className="bg-white border p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-4">
                    Thanh toán qua PayPal
                  </h2>
                  <PayPalButton
                    amount={getTotal()}
                    orderRef={payPalOrderRef}
                    onSuccess={handlePayPalSuccess}
                    onError={handlePayPalError}
                    onCancel={handlePayPalCancel}
                  />
                </div>
              ) : showMetaMaskButton && metamaskOrderRef ? (
                <div className="bg-white border p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-4">
                    Thanh toán qua MetaMask
                  </h2>
                  <MetaMaskButton
                    amount={getTotal()}
                    orderSlug={orderSlug}
                    onSuccess={handleMetaMaskSuccess}
                    onError={handleMetaMaskError}
                    onCancel={handleMetaMaskCancel}
                  />
                </div>
              ) : (
                <form onSubmit={handleSubmit} id="checkoutForm">
                  <ShippingForm
                    shippingInfo={shippingInfo}
                    errors={errors}
                    touched={touched}
                    onFieldChange={handleChange}
                    onFieldBlur={handleBlur}
                    onLocationChange={handleLocationChange}
                    onTouch={(field) =>
                      setTouched((prev) => ({ ...prev, [field]: true }))
                    }
                  />

                  <PaymentMethod
                    paymentMethod={paymentMethod}
                    onPaymentMethodChange={setPaymentMethod}
                  />

                  {/* <VoucherInput
                    productSlug={cartItems[0]?.slug}
                    userId={getUserIdFromToken() || undefined}
                    paymentMethod={getVoucherPaymentMethod(paymentMethod)}
                    totalAmount={getSubtotal()}
                    onApply={handleVoucherApplied}
                  /> */}

                  {/* <div className="mt-8">
                    <button
                      type="submit"
                      className={`w-full bg-blue-700 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-800 transition-colors ${
                        isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "ĐANG XỬ LÝ..." : "HOÀN TẤT ĐƠN HÀNG"}
                    </button>
                  </div> */}
                </form>
              )}
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-4">
                <OrderSummary
                  cartItems={cartItems}
                  subtotal={getSubtotal()}
                  shippingFee={getShippingFee()}
                  discountAmount={discountAmount}
                  total={getTotal()}
                  isSubmitting={isSubmitting}
                  shippingInfo={shippingInfoForSummary}
                  onSubmit={handleSubmit}
                  getSubtotal={getSubtotal}
                  paymentMethod={paymentMethod}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutSection;
