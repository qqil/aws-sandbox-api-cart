import { Module } from '@nestjs/common';
import { CartModule } from 'src/cart/cart.module';
import { OrderService } from './services/order.service';

@Module({
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
