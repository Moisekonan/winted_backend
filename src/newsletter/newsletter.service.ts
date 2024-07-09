import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscription } from './entities/newsletter.entity';
import { CreateNewsletterDto } from './dto/newsletter.dto';
import { EmailService } from 'src/common/services/email.service';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(NewsletterSubscription)
    private readonly newsletterRepository: Repository<NewsletterSubscription>,

    private readonly emailService: EmailService,
  ) {}

  async create(createNewsletterDto: CreateNewsletterDto): Promise<NewsletterSubscription> {
    const subscription = this.newsletterRepository.create(createNewsletterDto);
    await this.newsletterRepository.save(subscription);
    
    // Envoyer un e-mail de confirmation d'inscription
    await this.emailService.sendSubscriptionEmail(createNewsletterDto.email);

    return subscription;
  }

  async findAll(): Promise<NewsletterSubscription[]> {
    return await this.newsletterRepository.find();
  }
}
