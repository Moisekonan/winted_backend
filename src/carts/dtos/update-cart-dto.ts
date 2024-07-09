import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartInputDto {
  @ApiProperty({ description: 'The new quantity of the product in the cart' })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
