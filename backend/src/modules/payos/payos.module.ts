import { Module, forwardRef } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PayosService } from './payos.service'
import { PayosController } from './payos.controller'
import { OrderModule } from '../orders/order.module'
import { CheckoutModule } from '../checkouts/checkout.module'
import { Checkout, CheckoutSchema } from '../checkouts/schemas/checkout.schema'

/**
 * PayosModule
 * - Handles PayOS payment integration
 * - Registers Checkout model for PayosService
 * - Imports OrderModule and CheckoutModule for cross-module service usage
 */
@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Checkout.name, schema: CheckoutSchema },
		]),
		forwardRef(() => OrderModule),
		forwardRef(() => CheckoutModule),
	],
	providers: [PayosService],
	controllers: [PayosController],
	exports: [PayosService],
})
export class PayosModule {}