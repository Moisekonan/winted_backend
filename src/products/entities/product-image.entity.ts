import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ProductImage extends CoreEntity {
  [x: string]: any;

  @Column()
  imageUrl: string;

  @ManyToOne(() => Product, (product) => product.images)
  product: Product;
}
