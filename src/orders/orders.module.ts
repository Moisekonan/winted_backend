import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderDetails, OrderItems } from './entities/order.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { AwsService } from 'src/common/services/aws/aws.service';
import { ProductsModule } from 'src/products/products.module';
import { CartModule } from '../carts/cart.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderItems,
      OrderDetails,
      Payment,
      Product,
      User,
    ]),
    ProductsModule,
    CartModule,
  ],
  providers: [OrdersService, AwsService],
  controllers: [OrdersController],
})
export class OrdersModule {}
