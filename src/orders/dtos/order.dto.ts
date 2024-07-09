import { CoreOutput } from 'src/common/dao/output.dto';
import { OrderItems } from '../entities/order.entity';

export class OrderOutputDto extends CoreOutput {
  orders?: OrderItems[];
}
