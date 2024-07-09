import { Module } from '@nestjs/common';
// import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';
import { Category } from './category/entities/category.entity';
import { CartModule } from './carts/cart.module';
import { Cart } from './carts/entities/cart-product.entity';
import { Address } from './users/entities/user-address.entity';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/entities/payment.entity';
import { OrdersModule } from './orders/orders.module';
import { OrderDetails, OrderItems } from './orders/entities/order.entity';
import { AdminModule } from './admin/admin.module';
import configuration from './config/configuration';
import { typeOrmAsyncConfig } from 'db/data-source';
import { SubCategory } from './category/entities/sub-category.entity';
import { CategoryModule } from './category/category.module';
import { ContactModule } from './contact/contact.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ReviewsModule } from './reviews/reviews.module';
import { FavoriteModule } from './favorite/favorite.module';
import { AwsService } from './common/services/aws/aws.service';

const allModules = [
  CommonModule,
  UsersModule,
  AuthModule,
  ProductsModule,
  CategoryModule,
  CartModule,
  PaymentsModule,
  OrdersModule,
  AdminModule,
  ContactModule,
  NewsletterModule,
  ReviewsModule,
  FavoriteModule,
];

const allEntities = [
  User,
  Product,
  Category,
  SubCategory,
  Cart,
  Payment,
  Address,
  OrderItems,
  OrderDetails,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development', '.env.production'],
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    ...allModules,
    MailerModule.forRoot({
      transport: {
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: {
          user: 'mokonan99@gmail.com',
          pass: 'MjfI0yhZL7CFqvwQ',
        },
      },
      defaults: {
        from: '"NUMERAMA" <mokonan99@gmail.com>',
      },
    }),
  ],
  controllers: [],
  providers: [AwsService],
})
export class AppModule {}
