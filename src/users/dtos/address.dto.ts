import { CoreOutput } from 'src/common/dao/output.dto';
import { Address } from '../entities/user-address.entity';
import { ApiProperty } from '@nestjs/swagger';

export class AddressOutputDto extends CoreOutput {
  @ApiProperty({ description: 'Address details' })
  address?: Address;
}
