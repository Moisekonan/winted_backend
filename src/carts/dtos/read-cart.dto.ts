import { CoreOutput } from 'src/common/dao/output.dto';
import { Cart } from '../entities/cart-product.entity';

export class ReadCartOutputDto extends CoreOutput {
  carts?: Cart[];
}
