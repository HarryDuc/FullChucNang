import { useState, useCallback } from 'react'
// Sử dụng đúng react-hot-toast: import toast từ 'react-hot-toast'
import { toast } from 'react-hot-toast'
import { specificationService } from '../services/specification.service'
import { ISpecification, ICreateSpecification, IUpdateSpecification } from '../models/specification.model'

/**
 * Custom hook quản lý logic cho Specification (Thông số kỹ thuật)
 * Sử dụng react-hot-toast để hiển thị thông báo
 */
export const useSpecification = () => {
	// Danh sách specifications
	const [specifications, setSpecifications] = useState<ISpecification[]>([])
	// Trạng thái loading
	const [loading, setLoading] = useState(false)
	// Specification đang được chọn
	const [selectedSpec, setSelectedSpec] = useState<ISpecification | null>(null)

	/**
	 * Lấy danh sách specifications
	 * @param query - Tham số truy vấn (lọc, phân trang, ...)
	 */
	const fetchSpecifications = useCallback(async (query = {}) => {
		try {
			setLoading(true)
			const data = await specificationService.getAll(query)
			setSpecifications(data)
		} catch (error: any) {
			console.log('❌ Lỗi fetchSpecifications:', error)
			toast.error(error?.message || 'Lỗi lấy danh sách thông số kỹ thuật')
		} finally {
			setLoading(false)
		}
	}, [])

	/**
	 * Lấy chi tiết specification theo id
	 * @param id - ID của specification
	 */
	const fetchSpecificationBySlug = useCallback(async (slug: string) => {
		try {
			setLoading(true)
			const data = await specificationService.getBySlug(slug)
			setSelectedSpec(data)
			return data
		} catch (error: any) {
			console.log('❌ Lỗi fetchSpecificationBySlug:', error)
			toast.error(error?.message || 'Lỗi lấy chi tiết thông số kỹ thuật')
		} finally {
			setLoading(false)
		}
	}, [])

	/**
	 * Tạo mới specification
	 * @param data - Dữ liệu tạo mới
	 */
	const createSpecification = useCallback(async (data: ICreateSpecification) => {
		try {
			setLoading(true)
			const result = await specificationService.create(data)
			toast.success('Tạo thông số kỹ thuật thành công')
			return result
		} catch (error: any) {
			console.log('❌ Lỗi createSpecification:', error)
			toast.error(error?.message || 'Lỗi tạo thông số kỹ thuật')
		} finally {
			setLoading(false)
		}
	}, [])

	/**
	 * Cập nhật specification
	 * @param id - ID của specification
	 * @param data - Dữ liệu cập nhật
	 */
	const updateSpecification = useCallback(async (slug: string, data: IUpdateSpecification) => {
		try {
			setLoading(true)
			const result = await specificationService.update(slug, data)
			toast.success('Cập nhật thông số kỹ thuật thành công')
			return result
		} catch (error: any) {
			console.log('❌ Lỗi updateSpecification:', error)
			toast.error(error?.message || 'Lỗi cập nhật thông số kỹ thuật')
		} finally {
			setLoading(false)
		}
	}, [])

	/**
	 * Xóa specification
	 * @param id - ID của specification
	 */
	const deleteSpecification = useCallback(async (slug: string) => {
		try {
			setLoading(true)
			await specificationService.delete(slug)
			toast.success('Xóa thông số kỹ thuật thành công')
			setSpecifications(prev => prev.filter(spec => spec.slug !== slug))  
		} catch (error: any) {
			console.log('❌ Lỗi deleteSpecification:', error)
			toast.error(error?.message || 'Lỗi xóa thông số kỹ thuật')
		} finally {
			setLoading(false)
		}
	}, [])

	/**
	 * Cập nhật trạng thái hoạt động của specification
	 * @param id - ID của specification
	 * @param isActive - Trạng thái mới
	 */
	const updateSpecificationStatus = useCallback(async (slug: string, isActive: boolean) => {
		try {   
			setLoading(true)
			const result = await specificationService.updateStatus(slug, isActive)
			toast.success('Cập nhật trạng thái thành công')
			setSpecifications(prev =>
				prev.map(spec => (spec.slug === slug ? { ...spec, isActive } : spec))
			)
			return result
		} catch (error: any) {
			console.log('❌ Lỗi updateSpecificationStatus:', error)
			toast.error(error?.message || 'Lỗi cập nhật trạng thái')
		} finally {
			setLoading(false)
		}
	}, [])

	return {
		specifications,
		loading,
		selectedSpec,
		fetchSpecifications,
		fetchSpecificationBySlug,
		createSpecification,
		updateSpecification,
		deleteSpecification,
		updateSpecificationStatus,
		setSelectedSpec,
	}
}