import { ApiProperty } from '@nestjs/swagger';

export class CoreOutput {
  @ApiProperty({ required: false, description: 'Error message if any', type: 'string' })
  error?: string;

  @ApiProperty({ required: false, description: 'Success message if any', type: 'string' })
  message?: string;

  @ApiProperty({ description: 'Indicates whether the operation was successful', type: 'boolean' })
  success: boolean;

  @ApiProperty({ required: false, description: 'Data returned by the operation', type: 'array' })
  content?: any[] | any;

  @ApiProperty({ required: false, description: 'Data returned by the operation', type: 'object' })
  item?: any;

  @ApiProperty({ required: false, description: 'Total number of records', type: 'number' })
  total?: number;
}
