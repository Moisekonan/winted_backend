import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/reviews.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  createReview(reviewData: Partial<Review>) {
    const review = this.reviewRepository.create(reviewData);
    return this.reviewRepository.save(review);
  }

  getReviewsByProduct(productId: number) {
    return this.reviewRepository.find({
      where: { product: { id: productId } },
      relations: ['user', 'product'],
    });
  }
}