import { Inject, Injectable } from '@nestjs/common';
import {
  PAYPAL_AUTHORIZATION_SERVICE_INSTANCE_TOKEN,
  PAYPAL_AXIOS_INSTANCE_TOKEN,
  PAYPAL_MODULE_OPTIONS, PAYPAL_UTILS_SERVICE_INSTANCE_TOKEN
} from "../constants/paypal-constants";
import { AxiosInstance } from 'axios';
import { PaypalModuleOptions } from '../interfaces/paypal-module-options';
import { PaypalUtilsService } from '../services/paypal-utils.service';
import { PaypalErrorsConstants } from '../errors/paypal-errors-constants';
import { CheckoutService } from '../../checkouts/services/checkout.service';
import { OrderService } from '../../orders/services/order.service';

import { PaypalAuthorizationService } from './authorization.service';
import { AuthorizeOrderHeadersDto, CreatePaypalOrderDto, InitiateOrderHeadersDto, PaypalOrderDto } from '../dtos';
import { UpdatePaypalOrderDto } from '../dtos/order';
import { PaymentSourceResponseDto } from '../dtos/payment-source-response.dto';

@Injectable()
export class PaypalPaymentService {


  constructor(
    @Inject(PAYPAL_AXIOS_INSTANCE_TOKEN) private readonly axiosInstance: AxiosInstance,
    @Inject(PAYPAL_MODULE_OPTIONS) private readonly options: PaypalModuleOptions,
    @Inject(PAYPAL_AUTHORIZATION_SERVICE_INSTANCE_TOKEN) private paypalAuthorizationService: PaypalAuthorizationService,
    @Inject(PAYPAL_UTILS_SERVICE_INSTANCE_TOKEN) private paypalUtilsService: PaypalUtilsService,
    private readonly checkoutService: CheckoutService,
    private readonly orderService: OrderService,
  ) {

  }


  async _preparePaypalRequestHeaders(customHeaders?: any) {
    const initiateTokenResponse = await this.paypalAuthorizationService.getAccessToken();
    const { access_token } = initiateTokenResponse;
    return {
      'Content-Type': 'application/json',
      'Authorization': access_token ? `Bearer ${access_token}` : `Basic ${this.paypalAuthorizationService.getBasicKey()}`,
      ...customHeaders
    };
  }

  async initiateOrder(orderPayload: CreatePaypalOrderDto, headers?: InitiateOrderHeadersDto): Promise<PaypalOrderDto> {
    const _headers = await this._preparePaypalRequestHeaders(headers);
    const apiUrl = this.paypalUtilsService.getApiUrl(this.options.environment);
    return this.axiosInstance.post(`${apiUrl}/v2/checkout/orders`, orderPayload, {
      headers: _headers
    })
      .then(r => r.data)
      .catch(e => {
        throw {
          ...PaypalErrorsConstants.INITIATE_ORDER_FAILED,
          nativeError: e?.response?.data || e
        }
      });
  }


  async updateOrder(orderId: string, updateOrderDto: UpdatePaypalOrderDto[]): Promise<{ message: string }> {
    const _headers = await this._preparePaypalRequestHeaders();
    const apiUrl = this.paypalUtilsService.getApiUrl(this.options.environment);
    return this.axiosInstance.patch(`${apiUrl}/v2/checkout/orders/${orderId}`, updateOrderDto, {
      headers: _headers
    }).then(r => {
      if (r.status === 204) {
        return {
          message: `Order updated successfully.!`
        }
      }
      return r.data;
    }).catch(e => {
      throw {
        ...PaypalErrorsConstants.UPDATE_ORDER_FAILED,
        nativeError: e?.response?.data || e
      }
    })
  }


  async getOrderDetails(orderId: string): Promise<PaypalOrderDto> {
    const headers = await this._preparePaypalRequestHeaders();
    const apiUrl = this.paypalUtilsService.getApiUrl(this.options.environment);
    return this.axiosInstance.get(
      `${apiUrl}/v2/checkout/orders/${orderId}`,
      {
        headers
      }
    ).then(r => {
      if (r.status === 200) {
        return r.data;
      }
      throw {
        message: 'Un-expected error',
        data: r.data
      }
    }).catch(e => {
      throw {
        ...PaypalErrorsConstants.GET_ORDER_FAILED,
        nativeError: e?.response?.data || e
      }
    })
  }

  async authorizePaymentForOrder(orderId: string, payload: PaymentSourceResponseDto, headers?: AuthorizeOrderHeadersDto): Promise<PaypalOrderDto> {
    const _headers = await this._preparePaypalRequestHeaders(headers);
    const apiUrl = this.paypalUtilsService.getApiUrl(this.options.environment);

    return this.axiosInstance.post(`${apiUrl}/v2/checkout/orders/${orderId}/authorize`, payload, {
      headers: _headers
    })
      .then(r => r.data)
      .catch(e => {
        throw {
          ...PaypalErrorsConstants.AUTHORIZE_ORDER_FAILED,
          nativeError: e?.response?.data || e
        }
      })
  }

  async capturePaymentForOrder(orderId: string, payload: PaymentSourceResponseDto, headers?: AuthorizeOrderHeadersDto): Promise<PaypalOrderDto> {
    const _headers = await this._preparePaypalRequestHeaders(headers);
    const apiUrl = this.paypalUtilsService.getApiUrl(this.options.environment);

    try {
      const result = await this.axiosInstance.post(`${apiUrl}/v2/checkout/orders/${orderId}/capture`, payload, {
        headers: _headers
      });

      if (result.data.status === 'COMPLETED') {
        // Get the order code from the purchase unit
        const orderCode = result.data.purchase_units[0]?.custom_id;
        if (orderCode) {
          // Update order status
          await this.orderService.updatePaymentStatus(orderCode, {
            paymentMethod: 'paypal',
            // paymentStatus: 'paid',
            paymentInfo: {
              paypalOrderId: orderId,
              ...result.data
            }
          });

          // Find and update checkout status
          const checkout = await this.checkoutService.findOne(`${orderCode}-payment`);
          if (checkout) {
            await this.checkoutService.updatePaymentStatus(checkout.slug, 'paid');
          }
        }
      }

      return result.data;
    } catch (e) {
      throw {
        ...PaypalErrorsConstants.CAPTURE_ORDER_FAILED,
        nativeError: e?.response?.data || e
      }
    }
  }
}