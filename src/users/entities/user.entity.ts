import { Cart } from 'src/carts/entities/cart-product.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Address } from './user-address.entity';
import { OrderDetails } from 'src/orders/entities/order.entity';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Review } from 'src/reviews/entities/reviews.entity';
import { Favorite } from 'src/favorite/entities/favorite.entity';
import { Product } from 'src/products/entities/product.entity';

@Entity()
export class User extends CoreEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true, default: "Côte d''ivoire" })
  country: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.SELLER })
  role: UserRole;

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];

  @OneToMany(() => Address, (address) => address.user)
  address: Address[];

  @OneToMany(() => OrderDetails, (order) => order.user)
  orders: OrderDetails[];

  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @Column('boolean', { default: 0 })
  hasAddress: boolean;
}

@Entity()
export class Seller extends User {
  @Column({ nullable: true })
  nameStore: string;

  @Column({ nullable: true })
  logo: string;
}
