import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Category } from './category.entity';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class SubCategory extends CoreEntity {
  @Column({ unique: true })
  name: string;

  @ManyToOne(() => Category, (category) => category.subCategories)
  category: Category;

  @OneToMany(() => Product, (product) => product.subCategory)
  products: Product[];
}
