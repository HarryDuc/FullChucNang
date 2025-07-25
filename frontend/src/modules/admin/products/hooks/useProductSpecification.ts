import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { specificationService } from '../services/specification.service';
import { ISpecification } from '@/modules/admin/specification/models/specification.model';

export const useProductSpecification = () => {
  const [specifications, setSpecifications] = useState<ISpecification[]>([]);
  const [selectedSpecification, setSelectedSpecification] = useState<ISpecification | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch all specifications
  const fetchSpecifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await specificationService.getAll({ isActive: true });
      setSpecifications(data);
    } catch (error: any) {
      console.error('Error fetching specifications:', error);
      toast.error('Lỗi khi tải danh sách thông số kỹ thuật');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch specification by slug
  const fetchSpecificationBySlug = useCallback(async (slug: string) => {
    try {
      setLoading(true);
      const data = await specificationService.getBySlug(slug);
      setSelectedSpecification(data);
      return data;
    } catch (error: any) {
      console.error('Error fetching specification:', error);
      toast.error('Lỗi khi tải thông số kỹ thuật');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load specifications on mount
  useEffect(() => {
    fetchSpecifications();
  }, [fetchSpecifications]);

  return {
    specifications,
    selectedSpecification,
    loading,
    fetchSpecificationBySlug,
    setSelectedSpecification
  };
}; 