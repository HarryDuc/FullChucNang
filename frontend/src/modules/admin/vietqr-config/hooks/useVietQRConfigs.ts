import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  VietQRConfig,
  CreateVietQRConfigDto,
  UpdateVietQRConfigDto,
} from '../models/vietqr-config';
import { vietQRConfigService } from '../services/vietqr-config.service';

export const useVietQRConfigs = () => {
  const [configs, setConfigs] = useState<VietQRConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vietQRConfigService.getAll();
      setConfigs(data);
    } catch (err) {
      const errorMessage = 'Không thể tải danh sách cấu hình VietQR';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createConfig = async (data: CreateVietQRConfigDto) => {
    try {
      setLoading(true);
      setError(null);
      await vietQRConfigService.create(data);
      toast.success('Tạo cấu hình VietQR thành công');
      await fetchConfigs();
    } catch (err) {
      const errorMessage = 'Không thể tạo cấu hình VietQR';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (id: string, data: UpdateVietQRConfigDto) => {
    try {
      setLoading(true);
      setError(null);
      await vietQRConfigService.update(id, data);
      toast.success('Cập nhật cấu hình VietQR thành công');
      await fetchConfigs();
    } catch (err) {
      const errorMessage = 'Không thể cập nhật cấu hình VietQR';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const setActiveConfig = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await vietQRConfigService.setActive(id);
      toast.success('Kích hoạt cấu hình VietQR thành công');
      await fetchConfigs();
    } catch (err) {
      const errorMessage = 'Không thể kích hoạt cấu hình VietQR';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  return {
    configs,
    loading,
    error,
    createConfig,
    updateConfig,
    setActiveConfig,
    refreshConfigs: fetchConfigs,
  };
};