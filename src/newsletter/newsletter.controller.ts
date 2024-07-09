// newsletter.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { NewsletterSubscription } from './entities/newsletter.entity';
import { CreateNewsletterDto } from './dto/newsletter.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('newsletter')
@ApiTags('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post()
  async create(@Body() createNewsletterDto: CreateNewsletterDto): Promise<NewsletterSubscription> {
    return this.newsletterService.create(createNewsletterDto);
  }

  @Get()
  async findAll(): Promise<NewsletterSubscription[]> {
    return this.newsletterService.findAll();
  }
}
