import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { CoreEntity } from 'src/common/entities/core.entity';

@Entity()
export class Favorite extends CoreEntity {
  @ManyToOne(() => User, (user) => user.favorites)
  user: User;

  @ManyToOne(() => Product, (product) => product.favorites)
  product: Product;
}
