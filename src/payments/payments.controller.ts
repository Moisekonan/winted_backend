import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payments.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import RequestWithUser from 'src/auth/interfaces/requestWithUser.interface';
import { CreatePaymentInputDto } from './dtos/create-payment.dto';
import { CoreOutput } from 'src/common/dao/output.dto';
import { PaymentOutputDto } from './dtos/payment.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('payment')
@ApiTags('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('')
  createPayment(
    @Req() { user: { id } }: RequestWithUser,
    @Body() createPaymentDto: CreatePaymentInputDto,
  ): Promise<CoreOutput> {
    return this.paymentService.createUserPayment(id, createPaymentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':pid')
  deletePayment(
    @Param('pid', ParseIntPipe) paymentId: number,
    @Req() { user: { id } }: RequestWithUser,
  ): Promise<CoreOutput> {
    return this.paymentService.deleteUserPayment(id, paymentId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':pid')
  getPayment(
    @Param('pid', ParseIntPipe) paymentId: number,
    @Req() { user: { id } }: RequestWithUser,
  ): Promise<PaymentOutputDto> {
    return this.paymentService.getUserPayment(id, paymentId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  getPayments(@Req() { user: { id } }: RequestWithUser) {
    return this.paymentService.getUserPayments(id);
  }
}
