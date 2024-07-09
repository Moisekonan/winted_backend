import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import RequestWithUser from 'src/auth/interfaces/requestWithUser.interface';
import { OrderOutputDto } from './dtos/order.dto';
import { CreateOrderInputDto } from './dtos/create-order.dto';
import { CoreOutput } from 'src/common/dao/output.dto';
import { ApiTags } from '@nestjs/swagger';
import { SellerGuard } from 'src/common/guards/seller-only.guard';
import { UpdateOrderInputDto } from './dtos/update-order.dto';
import { AdminGuard } from '../common/guards/admin-only.guard';

@Controller('orders')
@ApiTags('orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  // Opérations Générales
  @Get('all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  listAllOrders(): Promise<OrderOutputDto> {
    return this.orderService.listAllOrders();
  }

  // Opérations pour les Utilisateurs Authentifiés
  @Get('')
  @UseGuards(JwtAuthGuard)
  listOrders(@Req() { user }: RequestWithUser): Promise<OrderOutputDto> {
    return this.orderService.listOrderByUser(user['userId']);
  }

  @Get(':orderId')
  @UseGuards(JwtAuthGuard)
  loadOrder(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.orderService.loadOrderDetails(orderId);
  }

  @Post('')
  @UseGuards(JwtAuthGuard)
  createOrder(
    @Req() { user }: RequestWithUser,
    @Body() order: CreateOrderInputDto,
  ): Promise<CoreOutput> {
    return this.orderService.createOrder(user['userId'], order);
  }

  // Opérations Spécifiques au Vendeur
  @Put('by-seller/:orderItem')
  @UseGuards(JwtAuthGuard, SellerGuard)
  async updateOrderItemBySeller(
    @Param('orderItem', ParseIntPipe) orderItem: number,
    @Body() updateOrderDto: UpdateOrderInputDto,
  ) {
    return this.orderService.updateOneOrderBySeller(orderItem, updateOrderDto);
  }

  @Get('by-seller/:id/all')
  @UseGuards(JwtAuthGuard, SellerGuard)
  async getAllOrdersBySeller(
    @Param('id', ParseIntPipe) sellerId: number,
  ): Promise<OrderOutputDto> {
    return this.orderService.getAllOrdersBySeller(sellerId);
  }

  @Get('by-seller/:sellerId/one-order/:orderId')
  @UseGuards(JwtAuthGuard, SellerGuard)
  async getOneOrderBySeller(
    @Param('sellerId', ParseIntPipe) sellerId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<OrderOutputDto> {
    return this.orderService.getOneOrderBySeller(sellerId, orderId);
  }
}
