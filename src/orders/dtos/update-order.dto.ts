import { OrderStatus } from 'src/common/enums/order-status.enum';

export class UpdateOrderInputDto {
  sellerId: number;
  productId: number;
  status: OrderStatus;
  quantity: number;
  shippingFeeOrderTotal?: number;
  addressLine1?: string;
  addressLine2?: string;
  country?: string;
  city?: string;
}

export class UpdateOrderByProductInputDto {
  orderId?: number;
  productId?: number;
  quantity?: number;
  shippingFeeOrderTotal?: number;
  status?: OrderStatus;
}
