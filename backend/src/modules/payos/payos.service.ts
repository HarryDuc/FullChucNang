import axios from 'axios';
import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Checkout } from '../checkouts/schemas/checkout.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PayosService {
  private clientId: string;
  private apiKey: string;
  private checksumKey: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Checkout.name) private readonly checkoutModel: Model<Checkout>,
  ) {
    this.clientId = this.configService.get<string>('PAYOS_CLIENT_ID') || '';
    this.apiKey = this.configService.get<string>('PAYOS_API_KEY') || '';
    this.checksumKey = this.configService.get<string>('PAYOS_CHECKSUM_KEY') || '';
  }

  // Tạo signature đúng chuẩn PayOS v2
  private generateSignature({ amount, cancelUrl, description, orderCode, returnUrl }: any) {
    // Sắp xếp alphabet các key và format đúng
    const raw = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`
    return crypto.createHmac('sha256', this.checksumKey).update(raw).digest('hex')
  }

  async createPaymentLink(order: {
    orderCode: number | string
    amount: number
    description: string
    returnUrl: string
    cancelUrl: string
    buyerName?: string
    buyerEmail?: string
    buyerPhone?: string
    buyerAddress?: string
    items?: any[]
    expiredAt?: number
  }) {
    // Tạo signature đúng chuẩn
    const signature = this.generateSignature(order)
    const body = {
      ...order,
      signature,
    }
    try {
      const response = await axios.post(
        'https://api-merchant.payos.vn/v2/payment-requests',
        body,
        {
          headers: {
            'x-client-id': this.clientId,
            'x-api-key': this.apiKey,
          },
        },
      )
      // Trả về đúng link thanh toán
      console.log(response.data)
      const data = response.data?.data
      return {
        ...response.data,
        payosPaymentLink: data?.checkoutUrl || data?.paymentUrl || data?.shortLink || null,
      }
    } catch (error) {
      console.error('PayOS API error:', error?.response?.data || error.message)
      throw new Error('PayOS API error: ' + (error?.response?.data?.message || error.message))
    }
  }

  // Xác thực signature webhook PayOS đúng chuẩn
  verifyPayosSignature(data: any, signature: string): boolean {
    function deepSortObj(obj: any): any {
      if (Array.isArray(obj)) {
        return obj.map(deepSortObj)
      } else if (obj && typeof obj === 'object') {
        return Object.keys(obj)
          .sort()
          .reduce((acc, key) => {
            acc[key] = deepSortObj(obj[key])
            return acc
          }, {} as any)
      }
      return obj
    }
    function convertObjToQueryStr(obj: any): string {
      return Object.keys(obj)
        .map((key) => {
          let value = obj[key]
          if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
            value = JSON.stringify(value)
          }
          if (value === null || value === undefined) value = ''
          return `${key}=${value}`
        })
        .join('&')
    }
    const sortedData = deepSortObj(data)
    const dataQueryStr = convertObjToQueryStr(sortedData)
    const expectedSignature = crypto.createHmac('sha256', this.checksumKey).update(dataQueryStr).digest('hex')
    return expectedSignature === signature
  }

  async findByOrderCode(orderCode: number | string) {
    return this.checkoutModel.findOne({ orderCode }).exec()
  }

}
