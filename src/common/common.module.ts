import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { AwsService } from './services/aws/aws.service';

@Module({
  providers: [EmailService, AwsService],
  exports: [EmailService, AwsService],
})
export class CommonModule {}
