import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { Address } from './entities/user-address.entity';
import { SellerService } from './sellers.service';
import { SellerController } from './sellers.controller';
import { AwsService } from 'src/common/services/aws/aws.service';
import { SmsService } from 'src/common/services/sms.service';
import { EmailService } from '../common/services/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Address])],
  providers: [UserService, SellerService, AwsService, SmsService, EmailService],
  controllers: [UserController, SellerController],
  exports: [UserService, SellerService, SmsService, AwsService, EmailService],
})
export class UsersModule {}
