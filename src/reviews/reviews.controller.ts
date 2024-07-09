import { Controller, Post, Body, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Review } from './entities/reviews.entity';
import { ReviewsService } from './reviews.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('reviews')
@ApiTags('reviews')
export class ReviewsController {
  constructor(private readonly reviewService: ReviewsService) {}

  @Post()
  createReview(@Body() reviewData: Partial<Review>) {
    return this.reviewService.createReview(reviewData);
  }

  @Get('product/:id')
  getReviewsByProduct(@Param('id', ParseIntPipe) productId: number) {
    return this.reviewService.getReviewsByProduct(productId);
  }
}