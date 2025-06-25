import { ethers } from 'ethers';
import api from '@/config/api';
import { config } from "@/config/config";
import { API_URL_CLIENT } from "@/config/apiRoutes";
const API_URL = API_URL_CLIENT + config.ROUTES.CHECKOUTS.BASE;

// Cấu hình mạng BSC
const BSC_CHAIN_ID = '0x38'; // Mainnet BSC
const BSC_TESTNET_CHAIN_ID = '0x61'; // Testnet BSC

// USDT Contract Addresses
const USDT_CONTRACT_ADDRESS = {
  mainnet: '0x55d398326f99059fF775485246999027B3197955', // BSC Mainnet USDT
  testnet: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd'  // BSC Testnet USDT
};

const BSC_NETWORK_PARAMS = {
  chainId: BSC_CHAIN_ID,
  chainName: 'Binance Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/'],
};

const BSC_TESTNET_PARAMS = {
  chainId: BSC_TESTNET_CHAIN_ID,
  chainName: 'Binance Smart Chain Testnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
  blockExplorerUrls: ['https://testnet.bscscan.com/'],
};

// Sử dụng testnet trong môi trường phát triển, mainnet trong môi trường sản phẩm
const NETWORK_PARAMS = process.env.NODE_ENV === 'production' ? BSC_NETWORK_PARAMS : BSC_TESTNET_PARAMS;
const CHAIN_ID = process.env.NODE_ENV === 'production' ? BSC_CHAIN_ID : BSC_TESTNET_CHAIN_ID;
const USDT_ADDRESS = process.env.NODE_ENV === 'production' ? USDT_CONTRACT_ADDRESS.mainnet : USDT_CONTRACT_ADDRESS.testnet;

// USDT Token ABI - chỉ include các function cần thiết
const USDT_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address recipient, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

class MetamaskPaymentService {
  private provider: ethers.providers.Web3Provider | null = null;
  private usdtContract: ethers.Contract | null = null;

  /**
   * Kiểm tra xem MetaMask đã được cài đặt chưa
   */
  isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
  }

  /**
   * Chuyển đổi sang mạng BSC
   */
  async switchToBSCNetwork(): Promise<boolean> {
    if (!window.ethereum) {
      throw new Error('MetaMask không được cài đặt');
    }

    try {
      // Thử chuyển sang mạng BSC
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAIN_ID }],
      });
      console.log('Đã chuyển sang mạng BSC thành công');
      return true;
    } catch (switchError: any) {
      // Mã lỗi 4902 có nghĩa là mạng chưa được thêm vào MetaMask
      if (switchError.code === 4902) {
        try {
          // Thêm mạng BSC vào MetaMask
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORK_PARAMS],
          });
          console.log('Đã thêm và chuyển sang mạng BSC thành công');
          return true;
        } catch (addError) {
          console.error('Không thể thêm mạng BSC vào MetaMask:', addError);
          throw new Error('Không thể thêm mạng BSC vào MetaMask. Vui lòng thêm thủ công.');
        }
      } else {
        console.error('Không thể chuyển sang mạng BSC:', switchError);
        throw new Error('Không thể chuyển sang mạng BSC. Vui lòng thử lại hoặc chuyển thủ công.');
      }
    }
  }

  /**
   * Kết nối với MetaMask và trả về địa chỉ ví
   */
  async connectWallet(): Promise<string> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask chưa được cài đặt. Vui lòng cài đặt tiện ích MetaMask trước.');
    }

    try {
      // Chuyển sang mạng BSC trước
      await this.switchToBSCNetwork();

      // Khởi tạo provider
      this.provider = new ethers.providers.Web3Provider(window.ethereum);

      // Yêu cầu quyền truy cập tài khoản
      const accounts = await this.provider.send('eth_requestAccounts', []);
      if (accounts.length === 0) {
        throw new Error('Không tìm thấy tài khoản MetaMask.');
      }

      // Khởi tạo USDT contract
      const signer = this.provider.getSigner();
      this.usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);

      // Kiểm tra lại xem đã chuyển sang mạng BSC chưa
      const network = await this.provider.getNetwork();
      const chainIdHex = `0x${network.chainId.toString(16)}`;

      if (chainIdHex !== CHAIN_ID) {
        throw new Error(`Vui lòng chuyển sang mạng ${NETWORK_PARAMS.chainName} để tiếp tục.`);
      }

      console.log('Đã kết nối với mạng BSC, chainId:', chainIdHex);

      // Trả về địa chỉ ví
      return ethers.utils.getAddress(accounts[0]);
    } catch (error: any) {
      console.error('Lỗi khi kết nối với MetaMask:', error);

      // Xử lý các lỗi MetaMask thường gặp
      if (error.code === 4001) {
        throw new Error('Bạn đã từ chối kết nối với MetaMask.');
      } else if (error.code === -32002) {
        throw new Error('Yêu cầu MetaMask đang xử lý. Vui lòng kiểm tra cửa sổ MetaMask.');
      }

      throw error;
    }
  }

  /**
   * Lấy thông tin thanh toán MetaMask cho một đơn hàng
   */
  async getPaymentInfo(checkoutSlug: string, receivingAddress: string): Promise<any> {
    try {
      const response = await api.post(`${API_URL}/metamask/${checkoutSlug}/payment-info`, {
        receivingAddress
      });

      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin thanh toán MetaMask:', error);
      throw error;
    }
  }

  /**
   * Thực hiện thanh toán USDT qua MetaMask
   */
  async makePayment(receivingAddress: string, amountInUSDT: string): Promise<string> {
    if (!this.provider || !this.usdtContract) {
      throw new Error('Chưa kết nối với MetaMask hoặc khởi tạo USDT contract.');
    }

    try {
      // Đảm bảo đã chuyển sang mạng BSC
      await this.switchToBSCNetwork();

      const signer = this.provider.getSigner();
      const walletAddress = await signer.getAddress();

      // Kiểm tra số dư USDT
      const balance = await this.usdtContract.balanceOf(walletAddress);
      const decimals = await this.usdtContract.decimals();
      const amountInWei = ethers.utils.parseUnits(amountInUSDT, decimals);

      if (balance.lt(amountInWei)) {
        throw new Error('Số dư USDT không đủ để thực hiện giao dịch.');
      }

      // Thực hiện chuyển USDT
      const tx = await this.usdtContract.transfer(receivingAddress, amountInWei);

      console.log('Giao dịch USDT đã được gửi:', tx);
      console.log('Xem giao dịch trên BSCScan:',
        `${NETWORK_PARAMS.blockExplorerUrls[0]}tx/${tx.hash}`);

      // Chờ giao dịch được xác nhận
      const receipt = await tx.wait();
      console.log('Giao dịch USDT đã được xác nhận:', receipt);

      return tx.hash;
    } catch (error: any) {
      console.error('Lỗi khi thanh toán USDT qua MetaMask:', error);

      // Xử lý các lỗi thường gặp
      if (error.code === 4001) {
        throw new Error('Bạn đã từ chối giao dịch.');
      } else if (error.code === -32603) {
        throw new Error('Lỗi nội bộ từ MetaMask. Vui lòng kiểm tra số dư USDT và thử lại.');
      } else if (error.code === -32000) {
        throw new Error('Số dư USDT không đủ để thực hiện giao dịch. Vui lòng nạp thêm USDT vào ví của bạn.');
      }

      throw error;
    }
  }

  /**
   * Xác minh giao dịch với backend
   */
  async verifyTransaction(checkoutSlug: string, transactionHash: string, amount: number, walletAddress: string): Promise<any> {
    try {
      // Lấy thông tin mạng hiện tại
      if (!this.provider) {
        throw new Error('Chưa kết nối với MetaMask.');
      }

      const network = await this.provider.getNetwork();
      const networkName = CHAIN_ID === BSC_CHAIN_ID ? 'BSC Mainnet' : 'BSC Testnet';

      const response = await api.post(`${API_URL}/metamask/${checkoutSlug}/verify`, {
        transactionHash,
        amount,
        walletAddress,
        chainId: network.chainId,
        network: networkName,
        blockExplorer: NETWORK_PARAMS.blockExplorerUrls[0]
      });

      return response.data;
    } catch (error) {
      console.error('Lỗi khi xác minh giao dịch USDT:', error);
      throw error;
    }
  }

  /**
   * Lấy URL xem giao dịch trên BSCScan
   */
  getTransactionExplorerUrl(transactionHash: string): string {
    return `${NETWORK_PARAMS.blockExplorerUrls[0]}tx/${transactionHash}`;
  }

  /**
   * Lấy URL xem địa chỉ ví trên BSCScan
   */
  getAddressExplorerUrl(address: string): string {
    return `${NETWORK_PARAMS.blockExplorerUrls[0]}address/${address}`;
  }
}

// Khởi tạo và export service singleton
const metamaskPaymentService = new MetamaskPaymentService();
export default metamaskPaymentService;

// Expose payment currency info
export const PAYMENT_CURRENCY = {
  name: "USDT",
  symbol: "USDT",
  decimals: 18,
  contractAddress: USDT_ADDRESS,
  network: process.env.NODE_ENV === 'production' ? 'BSC Mainnet' : 'BSC Testnet',
  blockExplorer: process.env.NODE_ENV === 'production'
    ? 'https://bscscan.com/'
    : 'https://testnet.bscscan.com/'
};

// Thêm định nghĩa global cho window.ethereum
declare global {
  interface Window {
    ethereum: any;
  }
}