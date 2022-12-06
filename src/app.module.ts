import { Module } from '@nestjs/common';

import { AppController } from './app.controller';

import { CartModule } from './cart/cart.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';
import { KnexModule } from './knex/knex.module';

@Module({
  imports: [
    KnexModule.forRoot({
      client: 'pg',
      connection: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT, 10),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      },
    }),
    AuthModule,
    CartModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
