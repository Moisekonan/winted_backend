import { IsOptional, IsString } from 'class-validator';

export class PagenationOption {
  @IsOptional()
  @IsString()
  offset: number;

  @IsOptional()
  @IsString()
  limit: number;

  @IsOptional()
  @IsString()
  v?: string;
}

// export interface PagenationOption {
//   offset: number;
//   limit: number;
//   v?: string;
// }
