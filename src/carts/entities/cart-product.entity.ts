import { CoreEntity } from 'src/common/entities/core.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, OneToOne, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Cart extends CoreEntity {
  @Column()
  name: string;

  @Column()
  quantity: number;

  @Column()
  userId: number;

  @Column()
  productId: number;

  @Column({ nullable: true })
  shippingFeeCart?: number;

  @ManyToOne(() => User, (user) => user.carts)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({nullable: true})
  total: number;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
  items: CartItem[];
}


@Entity()
export class CartItem extends CoreEntity {
  @ManyToOne(() => Product)
  product: Product;

  @ManyToOne(() => Cart)
  cart: Cart;

  @Column('int', { default: 1 })
  quantity: number;
}

