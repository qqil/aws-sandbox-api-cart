import { Injectable } from '@nestjs/common';
import { CartItem } from 'src/cart/models';
import { KnexService } from 'src/knex/knex.service';
import { ensureTrailingSlash } from 'src/shared/utils/url';
import { v4 } from 'uuid';
import { Order } from '../models';
import fetch from 'node-fetch';

@Injectable()
export class OrderService {
  constructor(protected readonly knexService: KnexService) {}

  async findById(orderId: string): Promise<Order | undefined> {
    const order: any[] = await this.knexService
      .getKnex()
      .select('*')
      .from('orders')
      .innerJoin('cart_items', 'orders.cart_id', 'cart_items.cart_id')
      .where('orders.id', orderId);

    if (!order || order.length === 0) return undefined;

    const {
      id,
      user_id: userId,
      cart_id: cartId,
      payment,
      delivery,
      comments,
      status,
      total,
    } = order[0];

    const items: CartItem[] = order[0].product_id
      ? await Promise.all(
          order.map(({ product_id, count }) =>
            fetch(
              new URL(
                `products/${product_id}`,
                ensureTrailingSlash(process.env.PRODUCT_SERVICE_URL),
              ).toString(),
              { method: 'GET' },
            ).then(async (response) => {
              if (!response.ok)
                throw new Error(`Failed to fetch product (ID: ${product_id})`);

              const { product }: any = await response.json();

              return {
                product: {
                  id: product.id,
                  title: product.title,
                  description: product.description,
                  price: product.price,
                },
                count,
              };
            }),
          ),
        )
      : [];

    return {
      id,
      userId,
      cartId,
      payment,
      delivery,
      comments,
      status,
      items,
      total,
    };
  }

  async create(orderData: Omit<Order, 'items' | 'status'>): Promise<Order> {
    const order = {
      id: this.generateOrderId(),
      user_id: orderData.userId,
      cart_id: orderData.cartId,
      payment: orderData.payment,
      delivery: orderData.delivery,
      comments: orderData.comments,
      status: 'inProgress',
      total: orderData.total,
    };

    this.knexService.getKnex().transaction(async (trx) => {
      await trx.insert(order).into('orders');
      await trx
        .update({ is_ordered: true })
        .table('cart')
        .where('id', order.cart_id);
    });

    return this.findById(order.id);
  }

  async update(orderId, orderData: Omit<Order, 'items' | 'id'>) {
    return this.knexService
      .getKnex()
      .table('orders')
      .update({
        user_id: orderData.userId,
        cart_id: orderData.cartId,
        payment: orderData.payment,
        delivery: orderData.delivery,
        comments: orderData.comments,
        status: orderData.status,
        total: orderData.total,
      })
      .where('id', orderId);
  }

  protected generateOrderId() {
    return v4();
  }
}
