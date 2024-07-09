import { CoreEntity } from 'src/common/entities/core.entity';
import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SubCategory } from './sub-category.entity';

@Entity()
export class Category extends CoreEntity {
  @Column({ unique: true })
  name: string;

  @Column()
  image: string;

  @OneToMany(() => SubCategory, (subCategory) => subCategory.category)
  subCategories: SubCategory[];
}
