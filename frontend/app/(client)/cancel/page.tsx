'use client'

import { useRouter } from 'next/navigation'

const CancelPage = () => {
  const router = useRouter()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Thanh toán đã bị hủy</h1>
      <div className="p-4 rounded bg-yellow-100 text-yellow-700">
        Bạn đã hủy thanh toán. Nếu cần hỗ trợ, vui lòng liên hệ CSKH.
      </div>
      <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => router.push('/')}>
        Quay về trang chủ
      </button>
    </div>
  )
}

export default CancelPage