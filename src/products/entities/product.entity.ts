import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { SubCategory } from '../../category/entities/sub-category.entity';
import { OrderItems } from 'src/orders/entities/order.entity';
import { ProductImage } from './product-image.entity';
import { Review } from 'src/reviews/entities/reviews.entity';
import { Favorite } from 'src/favorite/entities/favorite.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Product extends CoreEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  subTitle: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column({ default: 0 })
  quantity: number;

  @Column({ nullable: true })
  slug: string;

  @Column({ default: true })
  isInStock?: boolean;

  @Column()
  sellerID: number;

  @Column({ nullable: true })
  shippingFee: number;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  discount: number;

  @Column({ nullable: true, default: true })
  visibility: boolean;

  @ManyToOne(() => SubCategory, (subCategory) => subCategory.products)
  subCategory: SubCategory;

  @OneToMany(() => OrderItems, (order) => order.product)
  orders: OrderItems[];

  @OneToMany(() => ProductImage, (image) => image.product, {
    cascade: true,
  })
  images: ProductImage[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @OneToMany(() => Favorite, (favorite) => favorite.product)
  favorites: Favorite[];

  @ManyToOne(() => User, (user) => user.products)
  seller: User;
}
