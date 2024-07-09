import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCartInputDto {
  userId?: number;

  @ApiProperty({ description: 'The ID of the product to add to the cart' })
  @IsNotEmpty()
  @IsNumber()
  productId: number;
}
