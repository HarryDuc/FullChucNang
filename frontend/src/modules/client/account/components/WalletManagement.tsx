import React, { useState, useEffect } from "react";
import metamaskService from "@/common/services/metamask.service";
import toast from "react-hot-toast";

interface Wallet {
  address: string;
  isPrimary: boolean;
}

const WalletManagement: React.FC = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [linkingWallet, setLinkingWallet] = useState(false);
  const [removingAddress, setRemovingAddress] = useState("");
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const walletData = await metamaskService.getUserWallets();
      setWallets(walletData);
    } catch (error) {
      console.error("Error fetching wallets:", error);
      toast.error("Không thể tải danh sách ví");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleLinkWallet = async () => {
    if (!metamaskService.isMetaMaskInstalled()) {
      toast.error("Vui lòng cài đặt MetaMask để tiếp tục");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    try {
      setLinkingWallet(true);
      await metamaskService.linkWallet();
      toast.success("Liên kết ví thành công");
      fetchWallets();
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error("Bạn đã từ chối kết nối với MetaMask");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        console.error("Error linking wallet:", error);
        toast.error("Không thể liên kết ví");
      }
    } finally {
      setLinkingWallet(false);
    }
  };

  const handleSetPrimaryWallet = async (address: string) => {
    try {
      setLoading(true);
      await metamaskService.setPrimaryWallet(address);
      toast.success("Đã cập nhật ví chính");
      fetchWallets();
    } catch (error) {
      console.error("Error setting primary wallet:", error);
      toast.error("Không thể cập nhật ví chính");
    } finally {
      setLoading(false);
    }
  };

  const showRemoveConfirm = (address: string) => {
    setRemovingAddress(address);
    setShowRemoveModal(true);
  };

  const handleRemoveWallet = async () => {
    try {
      setLoading(true);
      await metamaskService.removeWallet(removingAddress);
      toast.success("Đã xóa ví");
      fetchWallets();
      setShowRemoveModal(false);
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        console.error("Error removing wallet:", error);
        toast.error("Không thể xóa ví");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="text-lg font-semibold">Quản lý ví MetaMask</h2>
        <button
          onClick={handleLinkWallet}
          disabled={linkingWallet}
          className={`flex items-center px-4 py-2 rounded text-white font-medium transition-colors ${
            linkingWallet
              ? "bg-orange-300 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600"
          }`}
        >
          {linkingWallet && (
            <svg
              className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          Thêm ví MetaMask
        </button>
      </div>
      {wallets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-700 mb-2">
            Bạn chưa liên kết ví MetaMask nào.
          </p>
          <p className="text-gray-500">
            Liên kết ví MetaMask để đăng nhập dễ dàng hơn và tương tác với các
            tính năng blockchain.
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {loading ? (
            <div className="flex justify-center py-8">
              <svg
                className="animate-spin h-6 w-6 text-orange-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : (
            wallets.map((wallet) => (
              <div
                key={wallet.address}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center">
                  <img
                    src="/metamask-fox.svg"
                    alt="MetaMask"
                    className="w-6 h-6 mr-2"
                  />
                  <div>
                    <span
                      className="font-mono text-gray-800 cursor-pointer select-all"
                      title={wallet.address}
                      onClick={() => {
                        navigator.clipboard.writeText(wallet.address);
                      }}
                    >
                      {formatAddress(wallet.address)}
                      <svg
                        className="inline ml-1 w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        style={{ verticalAlign: "middle" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 16h8a2 2 0 002-2V8m-4 12H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2"
                        />
                      </svg>
                    </span>
                    {wallet.isPrimary && (
                      <span className="ml-2 text-xs text-gray-500 font-medium">
                        (Ví chính)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {wallet.isPrimary ? (
                    <span
                      className="flex items-center text-green-600 text-sm"
                      title="Ví chính"
                    >
                      <svg
                        className="w-5 h-5 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Ví chính
                    </span>
                  ) : (
                    <button
                      className="p-2 rounded hover:bg-gray-100"
                      title="Đặt làm ví chính"
                      onClick={() => handleSetPrimaryWallet(wallet.address)}
                    >
                      <svg
                        className="w-5 h-5 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                      </svg>
                    </button>
                  )}
                  <button
                    className={`p-2 rounded hover:bg-gray-100 ${
                      wallet.isPrimary && wallets.length === 1
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    title="Xóa ví"
                    disabled={wallet.isPrimary && wallets.length === 1}
                    onClick={() => showRemoveConfirm(wallet.address)}
                  >
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal xác nhận xóa ví */}
      {showRemoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Xác nhận xóa ví</h3>
            <p className="mb-2">
              Bạn có chắc chắn muốn xóa ví{" "}
              <span className="font-mono">
                {formatAddress(removingAddress)}
              </span>
              ?
            </p>
            <p className="mb-4 text-gray-500 text-sm">
              Bạn sẽ không thể đăng nhập bằng ví này sau khi xóa.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setShowRemoveModal(false)}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                className={`px-4 py-2 rounded text-white ${
                  loading
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
                onClick={handleRemoveWallet}
                disabled={loading}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white inline-block mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : null}
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletManagement;
