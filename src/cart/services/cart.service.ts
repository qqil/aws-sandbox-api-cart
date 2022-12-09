import { Injectable } from '@nestjs/common';
import { KnexService } from 'src/knex/knex.service';
import { Cart, UpdateCartItem } from '../models';
import fetch from 'node-fetch';
import { ensureTrailingSlash } from 'src/shared/utils/url';
import { v4 } from 'uuid';
@Injectable()
export class CartService {
  constructor(protected readonly knexService: KnexService) {}

  async findByUserId(userId: string, isOrdered = false): Promise<Cart | null> {
    const cartData: any[] = await this.knexService
      .getKnex()
      .select('*')
      .from('cart')
      .leftJoin('cart_items', 'cart.id', 'cart_items.cart_id')
      .where('cart.user_id', userId)
      .andWhere('cart.is_ordered', isOrdered);

    if (!cartData || cartData.length === 0) return null;

    const { id } = cartData[0];

    const items = cartData[0].product_id
      ? await Promise.all(
          cartData.map(({ product_id, count }) =>
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

    return { id, items };
  }

  async createByUserId(userId: string): Promise<Cart> {
    await this.knexService
      .getKnex()
      .insert({ id: this.generateCartId(), user_id: userId })
      .into('cart');
    return this.findByUserId(userId);
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const userCart = await this.findByUserId(userId);

    return userCart ?? this.createByUserId(userId);
  }

  async updateByUserId(userId: string, items: UpdateCartItem[]): Promise<Cart> {
    const cart = await this.findOrCreateByUserId(userId);

    const itemsToRemoveFromCart = cart.items.filter(
      ({ product: cartProduct }) =>
        !items.find(({ product }) => cartProduct.id === product.id),
    );
    const itemsToUpdate = items.filter((item) =>
      cart.items.find(({ product }) => product.id === item.product.id),
    );
    const itemsToCreate = items.filter(
      (item) =>
        !cart.items.find(({ product }) => product.id === item.product.id),
    );

    await this.knexService.getKnex().transaction(async (trx) => {
      // Error: Upsert is not yet supported for dialect postgresql
      //
      // await trx('cart_items').upsert(
      //   items.map((item) => ({
      //     cart_id: cart.id,
      //     product_id: item.product.id,
      //     count: item.count,
      //   })),
      // );

      if (itemsToUpdate.length)
        await Promise.all(
          itemsToUpdate.map(({ product, count }) =>
            trx('cart_items')
              .update({
                product_id: product.id,
                count,
              })
              .where('cart_id', cart.id)
              .andWhere('product_id', product.id),
          ),
        );

      if (itemsToCreate.length)
        await trx('cart_items').insert(
          itemsToCreate.map(({ product, count }) => ({
            cart_id: cart.id,
            product_id: product.id,
            count,
          })),
        );

      if (itemsToRemoveFromCart.length)
        await trx('cart_items')
          .whereIn(
            'product_id',
            itemsToRemoveFromCart.map(({ product }) => product.id),
          )
          .andWhere('cart_id', cart.id)
          .delete();

      await trx('cart').update({ updated_at: new Date() });
    });

    return this.findOrCreateByUserId(userId);
  }

  async removeById(cartId: string): Promise<void> {
    await this.knexService.getKnex().table('cart').delete().where('id', cartId);
  }

  generateCartId() {
    return v4();
  }
}
