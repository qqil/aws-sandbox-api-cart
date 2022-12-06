import { IsJSON, IsString } from 'class-validator';

export class CheckoutDto {
  @IsJSON()
  payment: any;

  @IsJSON()
  delivery: any;

  @IsString()
  comments: string;
}
