import {
  Controller,
  Get,
  Delete,
  Put,
  Body,
  Req,
  Post,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CognitoGuard } from 'src/auth/guards/cognito.guard';
import { OrderService } from 'src/order/services/order.service';
import { AppRequest } from 'src/shared/models';
import { getUserIdFromRequest } from 'src/shared/models-rules';
import { CheckoutDto } from './dto/checkout.dto';
import { DeleteCartDto } from './dto/delete-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { calculateCartTotal } from './models-rules';
import { CartService } from './services/cart.service';

@Controller('api/profile/cart')
export class CartController {
  constructor(
    private cartService: CartService,
    private orderService: OrderService,
  ) {}

  @UseGuards(CognitoGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest) {
    const cart = await this.cartService.findOrCreateByUserId(
      getUserIdFromRequest(req),
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: { cart, total: calculateCartTotal(cart) },
    };
  }

  @UseGuards(CognitoGuard)
  @Put()
  async updateUserCart(
    @Req() req: AppRequest,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    const cart = await this.cartService.updateByUserId(
      getUserIdFromRequest(req),
      updateCartDto.items,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: {
        cart,
        total: calculateCartTotal(cart),
      },
    };
  }

  @UseGuards(CognitoGuard)
  @Delete()
  async clearUserCart(
    @Req() req: AppRequest,
    @Body() deleteCartDto: DeleteCartDto,
  ) {
    const userId = getUserIdFromRequest(req);
    const cart = await this.cartService.findByUserId(userId);

    if (cart.id !== deleteCartDto.cartId)
      throw new Error('User cart does not exist');

    await this.cartService.removeById(deleteCartDto.cartId);

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    };
  }

  @UseGuards(CognitoGuard)
  @Post('checkout')
  async checkout(@Req() req: AppRequest, @Body() checkoutDto: CheckoutDto) {
    const userId = getUserIdFromRequest(req);
    const cart = await this.cartService.findByUserId(userId);

    if (!(cart && cart.items.length)) {
      const statusCode = HttpStatus.BAD_REQUEST;
      req.statusCode = statusCode;

      return {
        statusCode,
        message: 'Cart is empty',
      };
    }

    const { id: cartId } = cart;

    const order = await this.orderService.create({
      ...checkoutDto,
      userId,
      cartId,
      total: calculateCartTotal(cart),
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: { order },
    };
  }
}
