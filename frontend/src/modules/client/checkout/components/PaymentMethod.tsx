interface PaymentMethodProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
}

const PaymentMethod = ({
  paymentMethod,
  onPaymentMethodChange,
}: PaymentMethodProps) => {
  return (
    <div className="bg-white border mb-8">
      <div className="border-b py-4 px-6 font-medium text-lg bg-gray-50">
        PHƯƠNG THỨC THANH TOÁN
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="radio"
              id="cod"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={() => onPaymentMethodChange("cod")}
              className="h-4 w-4 text-blue-900"
            />
            <label htmlFor="cod" className="ml-3 block text-gray-700">
              Thanh toán khi nhận hàng (COD)
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="bankTransfer"
              name="paymentMethod"
              value="bankTransfer"
              checked={paymentMethod === "bankTransfer"}
              onChange={() => onPaymentMethodChange("bankTransfer")}
              className="h-4 w-4 text-blue-900"
            />
            <label htmlFor="bankTransfer" className="ml-3 block text-gray-700">
              Chuyển khoản ngân hàng (Bank Transfer)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
