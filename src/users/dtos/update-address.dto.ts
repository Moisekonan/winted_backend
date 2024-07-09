import { ApiProperty } from "@nestjs/swagger";

export class UpdateAddressInputDto {
  @ApiProperty({ example: '123 Main St', description: 'Address line 1', required: false })
  addressLine1?: string;

  @ApiProperty({ example: 'Apt 101', description: 'Address line 2', required: false })
  addressLine2?: string;

  @ApiProperty({ example: 'New York', description: 'City', required: false })
  city?: string;

  @ApiProperty({ example: 10001, description: 'Postal code', required: false })
  postalCode?: number;

  @ApiProperty({ example: 'USA', description: 'Country', required: false })
  country?: string;
}