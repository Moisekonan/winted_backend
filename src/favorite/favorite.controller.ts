import { Controller, Post, Body, Get, Param, ParseIntPipe } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { Favorite } from './entities/favorite.entity';
import { ApiTags } from '@nestjs/swagger';

@Controller('favorites')
@ApiTags('favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post()
  addFavorite(@Body() favoriteData: Partial<Favorite>) {
    return this.favoriteService.addFavorite(favoriteData);
  }

  @Get('user/:id')
  getFavoritesByUser(@Param('id', ParseIntPipe) userId: number) {
    return this.favoriteService.getFavoritesByUser(userId);
  }
}