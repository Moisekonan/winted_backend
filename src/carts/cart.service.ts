import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart, CartItem } from './entities/cart-product.entity';
import { Repository } from 'typeorm';
import { AddCartInputDto } from './dtos/add-cart.dto';
import { Product } from 'src/products/entities/product.entity';
import { ReadCartOutputDto } from './dtos/read-cart.dto';
import { CoreOutput } from 'src/common/dao/output.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async addCart({ userId, productId }: AddCartInputDto): Promise<CoreOutput> {
    console.log(userId, productId);
    try {
      const exists = await this.cartRepository.findOne({
        where: { productId: productId },
      });
      console.log(exists);
      if (exists) {
        const cart = await this.cartRepository.findOne({
          where: { productId: productId },
        });
        cart.quantity++;
        console.log(cart);
        await this.cartRepository.save(cart);
      } else {
        console.log('else');
        const product = await this.productRepository.findOne({
          where: { id: productId },
        });
        console.log(product);
        const cart = this.cartRepository.create({
          name: product.name,
          quantity: 1,
          userId: userId,
          productId: productId,
        });
        console.log('cart created', cart);
        const tt = await this.cartRepository.save(cart);
        console.log('cart saved', tt);
      }

      // Retourne le nombre de product du panier
      const cart = await this.cartRepository.find({
        where: { userId: userId },
      });
      console.log(cart);

      return { success: true, content: cart.length };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Unknown error has occurred.' };
    }
  }

  async findCart(userId: number): Promise<ReadCartOutputDto> {
    try {
      const carts = await this.cartRepository.find({
        where: { userId: userId },
        relations: ['product'],
      });

      // Calculer le total pour chaque produit
      carts.forEach((cart) => {
        cart.total = cart.product.price * cart.quantity;
        cart.shippingFeeCart = cart.product.shippingFee * cart.quantity;
      });

      return { success: true, carts };
    } catch (error) {
      return { success: false, error: "Couldn't find cart" };
    }
  }

  async deleteCart(userId: number, cartId: number): Promise<CoreOutput> {
    try {
      const cart = await this.cartRepository.findOne({ where: { id: cartId } });
      if (cart.userId !== userId) {
        return { success: false, error: 'Not allowed.' };
      }

      await this.cartRepository
        .createQueryBuilder()
        .delete()
        .from(Cart)
        .where('id = :id', { id: cartId })
        .execute();

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Unknown error has occurred.' };
    }
  }

  async updateCart(cartId: number, quantity: number): Promise<CoreOutput> {
    try {
      const cart = await this.cartRepository.findOne({ where: { id: cartId } });

      cart.quantity = quantity;
      await this.cartRepository.save(cart);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Unknown error has occurred.' };
    }
  }

  async listAllCarts(): Promise<ReadCartOutputDto> {
    try {
      const carts = await this.cartRepository.find();
      return { success: true, content: carts };
    } catch (error) {
      return { success: false, error: 'Unknown error has occurred.' };
    }
  }

  async listCartsByUser(userId: number): Promise<Cart[]> {
    return this.cartRepository.find({ where: { userId: userId } });
  }

  async clearCart(userId: number): Promise<CoreOutput> {
    try {
      // Trouver tous les éléments du panier associés à l'utilisateur
      const cartItems = await this.cartRepository.find({
        where: { userId: userId },
      });

      // Supprimer chaque élément du panier
      for (const cartItem of cartItems) {
        await this.cartRepository.delete(cartItem.id);
      }

      console.log(cartItems.length);
      const cartItems2 = await this.cartRepository.find({
        where: { userId: userId },
      });
      console.log(cartItems2.length);

      return { success: true, message: 'Cart cleared successfully.' };
    } catch (error) {
      return { success: false, error: 'Failed to clear cart.' };
    }
  }
}
