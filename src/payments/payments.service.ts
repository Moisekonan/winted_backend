import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { In, Repository } from 'typeorm';
import { CreatePaymentInputDto } from './dtos/create-payment.dto';
import { CoreOutput } from 'src/common/dao/output.dto';
import { PaymentOutputDto, PaymentsOutputDto } from './dtos/payment.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private payments: Repository<Payment>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUserPayment(
    userId: number,
    { paymentType, accountNumber, expire }: CreatePaymentInputDto,
  ): Promise<CoreOutput> {
    try {
      const exists = await this.payments.findOne({
        where: { accountNumber: accountNumber },
      });
      if (exists) {
        return { success: false, error: 'Payment method already exists' };
      }
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return { success: false, error: 'User not exists' };
      }
      const payment = this.payments.create({
        paymentType,
        accountNumber,
        expire,
        userId: user.id,
      });
      const savePay = await this.payments.save(payment);
      return { success: true, content: savePay };
    } catch (error) {
      return { success: false, error: 'Unknown error has occurred.' };
    }
  }

  async deleteUserPayment(
    userId: number,
    paymentId: number,
  ): Promise<CoreOutput> {
    try {
      const payment = await this.payments.findOne({ where: { id: paymentId } });
      if (!payment) {
        return { success: false, error: 'Payment method not exists' };
      }

      if (payment.userId !== userId) {
        return { success: false, error: 'Not your wallet.' };
      }

      await this.payments
        .createQueryBuilder()
        .delete()
        .from(Payment)
        .where('id = :id', { id: paymentId })
        .execute();

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Unknown error has occurred.' };
    }
  }

  async getUserPayment(
    userId: number,
    paymentId: number,
  ): Promise<PaymentOutputDto> {
    try {
      const payment = await this.payments.findOne({
        where: { id: paymentId },
      });

      if (!payment) {
        return { success: false, error: 'Payment method not exists.' };
      }

      if (payment.userId !== userId) {
        return { success: false, error: 'Not your wallet.' };
      }

      return { success: true, payment };
    } catch (error) {
      return { success: false, error: 'Unknown error has occurred.' };
    }
  }

  async getUserPayments(userId: number): Promise<PaymentsOutputDto> {
    try {
      const payment = await this.payments.find({ where: { userId: userId } });
      return { success: true, payment };
    } catch (error) {
      return { success: false, error: 'Unknown error has occurred.' };
    }
  }
}
