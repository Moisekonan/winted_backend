import { CoreOutput } from 'src/common/dao/output.dto';
import { Category } from '../entities/category.entity';
import { SubCategory } from '../entities/sub-category.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryOutputDto extends CoreOutput {
  categories?: Category[];
}

export class SubCategoryOutputDto extends CoreOutput {
  subCategories?: SubCategory[];
}
