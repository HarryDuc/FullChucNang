import { ethers } from 'ethers';
import api from '../../config/api';
import { ApiResponse } from '../types/api-response';
import axios, { AxiosError } from 'axios';

/**
 * Service for MetaMask authentication
 */
export class MetamaskService {
  private static instance: MetamaskService;
  private provider: ethers.providers.Web3Provider | null = null;
  private isConnecting: boolean = false;
  private connectionPromise: Promise<string> | null = null;

  /**
   * Get singleton instance
   */
  public static getInstance(): MetamaskService {
    if (!MetamaskService.instance) {
      MetamaskService.instance = new MetamaskService();
    }
    return MetamaskService.instance;
  }

  /**
   * Check if MetaMask is installed
   */
  public isMetaMaskInstalled(): boolean {
    return window.ethereum && window.ethereum.isMetaMask;
  }

  /**
   * Connect to MetaMask
   */
  public async connect(): Promise<string> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    // Nếu đang có một yêu cầu kết nối đang xử lý, trả về promise đó
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    try {
      this.isConnecting = true;

      // Tạo promise mới và lưu lại để sử dụng nếu có yêu cầu đồng thời
      this.connectionPromise = this.performConnection();

      // Chờ kết nối hoàn tất
      const address = await this.connectionPromise;
      return address;
    } finally {
      // Đảm bảo reset trạng thái sau khi hoàn thành, dù thành công hay thất bại
      setTimeout(() => {
        this.isConnecting = false;
        this.connectionPromise = null;
      }, 1000); // Thêm delay nhỏ để tránh các yêu cầu quá nhanh
    }
  }

  /**
   * Thực hiện kết nối thực tế với MetaMask
   */
  private async performConnection(): Promise<string> {
    try {
      // Initialize provider
      this.provider = new ethers.providers.Web3Provider(window.ethereum);

      // Request account access
      const accounts = await this.provider.send('eth_requestAccounts', []);
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      return ethers.utils.getAddress(accounts[0]);
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      throw error;
    }
  }

  /**
   * Get the current connected account
   */
  public async getAccount(): Promise<string | null> {
    if (!this.isMetaMaskInstalled() || !this.provider) {
      return null;
    }

    try {
      const accounts = await this.provider.send('eth_accounts', []);
      if (accounts.length === 0) {
        return null;
      }
      return ethers.utils.getAddress(accounts[0]);
    } catch (error) {
      console.error('Error getting account:', error);
      return null;
    }
  }

  /**
   * Sign a message with MetaMask
   */
  private async signMessage(message: string): Promise<string> {
    if (!this.isMetaMaskInstalled() || !this.provider) {
      throw new Error('MetaMask is not connected');
    }

    try {
      console.log('Message to sign:', message);
      const signer = this.provider.getSigner();

      // Phải lấy địa chỉ từ signer để hiển thị đúng địa chỉ trong yêu cầu chữ ký
      const address = await signer.getAddress();
      console.log('Signing with address:', address);

      const signature = await signer.signMessage(message);
      console.log('Signature:', signature);

      return signature;
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }

  /**
   * Get a nonce from the backend
   */
  private async getNonce(address: string): Promise<string> {
    try {
      console.log('Requesting nonce for address:', address);

      // Đảm bảo địa chỉ được chuẩn hóa
      const checksumAddress = ethers.utils.getAddress(address);
      console.log('Normalized to checksum address:', checksumAddress);

      // Thêm retry logic và timeout dài hơn
      let attempts = 0;
      const maxAttempts = 3;
      let lastError: any = null;

      while (attempts < maxAttempts) {
        try {
          attempts++;
          console.log(`Attempt ${attempts} to get nonce...`);

          const response = await api.post('/auth/metamask/nonce',
            { address: checksumAddress },
            {
              timeout: 10000, // 10 giây
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );

          console.log(`Raw nonce response (attempt ${attempts}):`, response.data);

          // Kiểm tra xem response có đúng định dạng không
          if (!response || !response.data) {
            throw new Error('Invalid response format: Missing response.data');
          }

          // Trường hợp 1: Định dạng API tiêu chuẩn {success, message, data: {nonce}}
          if (response.data.data && response.data.data.nonce) {
            console.log('Using standard API response format with data.data.nonce');
            return response.data.data.nonce;
          }

          // Trường hợp 2: Định dạng trực tiếp {nonce}
          if (response.data.nonce) {
            console.log('Using direct response format with nonce property');
            return response.data.nonce;
          }

          // Nếu không tìm thấy nonce nhưng không có lỗi, đây là lỗi định dạng
          throw new Error(`Invalid response format, could not find nonce: ${JSON.stringify(response.data)}`);
        } catch (err) {
          lastError = err;
          console.error(`Attempt ${attempts} failed:`, err);

          // Nếu không phải là lỗi mạng/timeout, không cần thử lại
          if (axios.isAxiosError(err) && (!err.response || (err.response.status !== 408 && err.response.status !== 504))) {
            break;
          }

          // Chờ trước khi thử lại
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Tăng thời gian chờ mỗi lần
          }
        }
      }

      // Nếu đã thử tất cả các lần mà vẫn thất bại
      console.error('All attempts to get nonce failed:', lastError);
      throw lastError || new Error('Failed to get nonce after multiple attempts');
    } catch (error: unknown) {
      console.error('Error getting nonce:', error);
      // Thêm thông tin chi tiết về lỗi
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        // Lỗi từ máy chủ (status code không phải 2xx)
        if (axiosError.response) {
          console.error('Server response error:', {
            status: axiosError.response.status,
            data: axiosError.response.data
          });
          throw new Error(`Server error: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`);
        } else if (axiosError.request) {
          // Không nhận được phản hồi từ máy chủ
          console.error('No response received from server');
          throw new Error('No response received from server');
        }
      }
      throw error;
    }
  }

  /**
   * Authenticate with MetaMask
   */
  public async authenticate(): Promise<any> {
    try {
      // Connect to MetaMask - sử dụng cơ chế chống lặp yêu cầu
      const address = await this.connect();
      console.log('Connected to address:', address);

      // Get a nonce from the backend
      const nonce = await this.getNonce(address);
      console.log('Got nonce for authentication:', nonce);

      if (!nonce) {
        throw new Error('Không nhận được nonce từ server. Vui lòng thử lại.');
      }

      // Đảm bảo chuỗi nonce là đầy đủ
      if (typeof nonce !== 'string' || nonce.trim() === '') {
        console.error('Invalid nonce received:', nonce);
        throw new Error('Invalid nonce format received from server');
      }

      // Sign the nonce - đảm bảo dùng đúng chuỗi cần ký
      const signature = await this.signMessage(nonce);
      console.log('Signed message successfully with signature length:', signature.length);

      if (!signature || signature.length < 20) {
        throw new Error('Invalid signature generated. Please try again.');
      }

      // Authenticate with the backend
      console.log('Sending authentication request with:', { address, signature: signature.substring(0, 20) + '...' });

      // Thêm timeout dài hơn để đảm bảo server có đủ thời gian xử lý
      const response = await api.post('/auth/metamask/authenticate', {
        address,
        signature,
      }, {
        timeout: 30000, // 30 giây
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Authentication response:', response.data);

      // Xử lý cả hai định dạng response có thể nhận được
      let token, user;

      // Trường hợp 1: Định dạng API tiêu chuẩn {success, message, data: {token, user}}
      if (response.data && response.data.data) {
        token = response.data.data.token;
        user = response.data.data.user;
      }
      // Trường hợp 2: Định dạng trực tiếp {token, user}
      else if (response.data) {
        token = response.data.token;
        user = response.data.user;
      }

      if (!token || !user) {
        console.error('Invalid authentication response format:', response.data);
        throw new Error('Missing token or user data from authentication response');
      }

      // Store the token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('Authentication successful');
      return { token, user };
    } catch (error) {
      console.error('Error authenticating with MetaMask:', error);
      throw error;
    }
  }

  /**
   * Link a MetaMask wallet to the current user account
   */
  public async linkWallet(): Promise<any> {
    try {
      // Connect to MetaMask
      const address = await this.connect();

      // Create a message to sign
      const message = `Sign this message to link your wallet: ${Date.now().toString()}`;

      // Sign the message
      const signature = await this.signMessage(message);

      // Link the wallet
      const response = await api.post<ApiResponse<any>>('/auth/metamask/link', {
        address,
        signature,
      });

      // Kiểm tra phản hồi
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from wallet linking');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error linking wallet:', error);
      throw error;
    }
  }

  /**
   * Get all wallets for the current user
   */
  public async getUserWallets(): Promise<any> {
    try {
      const response = await api.get<ApiResponse<any>>('/auth/metamask/wallets');

      // Kiểm tra phản hồi
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response when getting user wallets');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error getting user wallets:', error);
      throw error;
    }
  }

  /**
   * Remove a wallet from the current user account
   */
  public async removeWallet(address: string): Promise<any> {
    try {
      const response = await api.delete<ApiResponse<any>>(`/auth/metamask/wallets/${address}`);

      // Kiểm tra phản hồi
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response when removing wallet');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error removing wallet:', error);
      throw error;
    }
  }

  /**
   * Set a wallet as the primary wallet for the current user
   */
  public async setPrimaryWallet(address: string): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(`/auth/metamask/wallets/${address}/primary`);

      // Kiểm tra phản hồi
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response when setting primary wallet');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error setting primary wallet:', error);
      throw error;
    }
  }
}

// Add global types for window.ethereum
declare global {
  interface Window {
    ethereum: any;
  }
}

export default MetamaskService.getInstance();