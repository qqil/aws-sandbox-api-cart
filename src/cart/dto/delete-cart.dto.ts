import { IsString } from 'class-validator';

export class DeleteCartDto {
  @IsString()
  cartId: string;
}
