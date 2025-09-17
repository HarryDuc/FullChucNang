'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const ReturnPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'success' | 'fail' | 'pending'>('pending')
  const [message, setMessage] = useState('Đang xác thực thanh toán...')

  useEffect(() => {
    const orderCode = searchParams.get('orderCode')
    const statusParam = searchParams.get('status')
    // Gọi API backend để kiểm tra trạng thái thanh toán thực tế
    if (orderCode) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/payos/check-payment-status?orderCode=${orderCode}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'paid' || statusParam === 'PAID') {
            setStatus('success')
            setMessage('Thanh toán thành công! Cảm ơn bạn đã mua hàng.')
          } else if (data.status === 'failed' || statusParam === 'FAILED') {
            setStatus('fail')
            setMessage('Thanh toán thất bại hoặc bị hủy.')
          } else {
            setStatus('pending')
            setMessage('Đơn hàng đang chờ thanh toán hoặc xác thực.')
          }
        })
        .catch(() => {
          setStatus('fail')
          setMessage('Không xác thực được trạng thái thanh toán.')
        })
    } else {
      setStatus('fail')
      setMessage('Không tìm thấy mã đơn hàng.')
    }
  }, [searchParams])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Kết quả thanh toán</h1>
      <div className={`p-4 rounded ${status === 'success' ? 'bg-green-100 text-green-700' : status === 'fail' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
        {message}
      </div>
      <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => router.push('/')}>Quay về trang chủ</button>
    </div>
  )
}

export default ReturnPage