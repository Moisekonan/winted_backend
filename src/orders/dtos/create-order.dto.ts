import { OrderStatus } from 'src/common/enums/order-status.enum';

export class CreateOrderInputDto {
  sellerId: number;
  productId: number;
  status: OrderStatus.NEW;
  quantity: number;
  shippingFeeOrderTotal?: number;
  addressLine1?: string;
  addressLine2?: string;
  country?: string;
  city?: string;
}
