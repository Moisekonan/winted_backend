import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  addFavorite(favoriteData: Partial<Favorite>) {
    const favorite = this.favoriteRepository.create(favoriteData);
    return this.favoriteRepository.save(favorite);
  }

  getFavoritesByUser(userId: number) {
    return this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['product'],
    });
  }
}