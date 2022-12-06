import { UpdateCartItem } from '../models';
import { IsNotEmpty } from 'class-validator';

export class UpdateCartDto {
  @IsNotEmpty()
  items: UpdateCartItem[];
}
