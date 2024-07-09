import { CoreOutput } from 'src/common/dao/output.dto';
import { Payment } from '../entities/payment.entity';

export class PaymentOutputDto extends CoreOutput {
  payment?: Payment;
}

export class PaymentsOutputDto extends CoreOutput {
  payment?: Payment[];
}
