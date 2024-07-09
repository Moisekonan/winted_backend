import { CoreOutput } from 'src/common/dao/output.dto';
import { Product } from '../entities/product.entity';
import { Category } from '../../category/entities/category.entity';
import { SubCategory } from '../../category/entities/sub-category.entity';

export class ProductOutputDto extends CoreOutput {
  products?: Product[];
  categories?: Category[];
  subCategories?: SubCategory[];
}
