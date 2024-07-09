import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Body,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import RequestWithUser from 'src/auth/interfaces/requestWithUser.interface';
import { AddCartInputDto } from './dtos/add-cart.dto';
import { UpdateCartInputDto } from './dtos/update-cart-dto';
import { CoreOutput } from 'src/common/dao/output.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminPersonalSellerGuard } from 'src/common/guards/admin-personal.guard';
import { UserService } from 'src/users/users.service';

@Controller('cart')
@ApiTags('carts')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly userService: UserService,
  ) {}

  @Post('')
  @ApiOperation({ summary: 'Add a product to the cart' })
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully added to the cart',
  })
  addCart(
    @Req() { user }: RequestWithUser,
    @Body() addCartInput: AddCartInputDto,
  ): Promise<CoreOutput> {
    addCartInput.userId = user['userId'];
    return this.cartService.addCart(addCartInput);
  }

  @Get('')
  @ApiOperation({ summary: 'Get the user cart' })
  @ApiResponse({
    status: 200,
    description: 'Returns the cart items for the user',
  })
  readCart(@Req() { user }: RequestWithUser) {
    return this.cartService.findCart(user['userId']);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, AdminPersonalSellerGuard)
  @ApiOperation({ summary: 'Get all carts, Only the ADMIN' })
  @ApiResponse({
    status: 200,
    description: 'Returns all carts',
  })
  async listAllCarts() {
    try {
      // Récupérer tous les utilisateurs
      const users = await this.userService.getAllUsers();
      const cartsByUser = [];
      // Pour chaque utilisateur, récupérer ses paniers
      for (const user of users) {
        const carts = await this.cartService.listCartsByUser(user.id);
        cartsByUser.push({ user: user, carts: carts });
      }

      return { success: true, data: cartsByUser };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Unknown error has occurred.',
      };
    }
  }

  @Delete(':cid')
  @ApiOperation({ summary: 'Delete an item from the cart' })
  @ApiResponse({
    status: 200,
    description: 'The item has been successfully deleted from the cart',
  })
  deleteCart(@Req() { user }: RequestWithUser, @Param('cid') cartId: number) {
    return this.cartService.deleteCart(user['userId'], cartId);
  }

  @Patch(':cid')
  @ApiOperation({ summary: 'Update the quantity of an item in the cart' })
  @ApiResponse({
    status: 200,
    description:
      'The quantity of the item in the cart has been successfully updated',
  })
  updateCart(@Body() body: UpdateCartInputDto, @Param('cid') cartId: number) {
    const { quantity } = body;
    return this.cartService.updateCart(cartId, quantity);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Delete an item from the cart' })
  @ApiResponse({
    status: 200,
    description: 'The item has been successfully deleted from the cart',
  })
  clearCart(@Req() { user }: RequestWithUser) {
    return this.cartService.clearCart(user['userId']);
  }
}
