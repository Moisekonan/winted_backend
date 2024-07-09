import { CoreOutput } from 'src/common/dao/output.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UserOutputDto extends CoreOutput {
  @ApiProperty({ description: 'User details' })
  user?: IUser;
}

export interface IUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  role: string;
  carts?: any[];
  address?: any[];
  orders?: any[];
  hasAddress: boolean;
  createdAt: Date;
  updatedAt: Date;
}
