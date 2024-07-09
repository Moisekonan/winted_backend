import { CoreEntity } from 'src/common/entities/core.entity';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { ProductOrderStatus } from 'src/common/enums/product-order-status.enum';
import { Payment } from 'src/payments/entities/payment.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class OrderDetails extends CoreEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ nullable: true })
  paymentId: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  addressId: string;

  @Column()
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column()
  country: string;

  @Column()
  city: string;

  @Column()
  status: OrderStatus;

  @Column({ nullable: true, unique: true })
  reference: string;

  @Column({ nullable: true })
  shippingFeeOrderDetailTotal: number;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Payment, (payment) => payment.orders, { nullable: true })
  @JoinColumn({ name: 'paymentId' })
  payment: Payment | null;

  @OneToMany(() => OrderItems, (order) => order.detail)
  orders: OrderItems[];
}

@Entity()
export class OrderItems extends CoreEntity {
  @Column()
  quantity: number;

  @Column()
  orderId: number;

  @Column()
  productId: number;

  @Column({ nullable: true })
  shippingFeeOrderTotal: number;

  @Column({ nullable: true })
  price: number;

  @ManyToOne(() => OrderDetails, (detail) => detail.orders)
  @JoinColumn({ name: 'orderId' })
  detail: OrderDetails;

  @ManyToOne(() => Product, (product) => product.orders)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({
    type: 'enum',
    enum: ProductOrderStatus,
    default: ProductOrderStatus.NEW,
  })
  status: OrderStatus;
}
