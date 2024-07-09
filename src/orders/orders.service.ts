import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDetails, OrderItems } from './entities/order.entity';
import { Repository } from 'typeorm';
import { OrderOutputDto } from './dtos/order.dto';
import { CreateOrderInputDto } from './dtos/create-order.dto';
import { CoreOutput } from 'src/common/dao/output.dto';
import { Payment } from 'src/payments/entities/payment.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { ProductService } from 'src/products/products.service';
import { AwsService } from 'src/common/services/aws/aws.service';
import { UpdateOrderByProductInputDto } from './dtos/update-order.dto';
import { CartService } from '../carts/cart.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderItems)
    private orderItemsRepository: Repository<OrderItems>,
    @InjectRepository(OrderDetails)
    private orderDetailsRepository: Repository<OrderDetails>,
    @InjectRepository(Payment)
    private paymentsRepositoty: Repository<Payment>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly _productService: ProductService,
    private readonly _awsService: AwsService,
    private readonly _cartService: CartService,
  ) {}

  async createOrder(
    userId: number,
    createOrderDto?: CreateOrderInputDto,
  ): Promise<CoreOutput> {
    try {
      const { addressLine1, addressLine2, city, country } = createOrderDto;
      const seller = await this.usersRepository.findOne({
        where: { id: userId },
        relations: ['carts'],
      });
      const cart = seller.carts;

      const orderDetail = this.orderDetailsRepository.create({
        price: 0,
        userId: seller.id,
        status: OrderStatus.NEW,
        addressLine1: addressLine1,
        addressLine2: addressLine2,
        country: country,
        city: city,
      });

      // Calculer le nombre total de produits dans la commande
      const totalProductsCount = cart.reduce(
        (acc, item) => acc + Number(item.quantity),
        0,
      );

      // Générer la référence de commande
      orderDetail.reference = this.generateOrderReference(totalProductsCount);

      await this.orderDetailsRepository.save(orderDetail);

      // Initialiser le prix total à 0
      let totalPrice = 0;
      let sheppindFeeItems = 0;

      for (const cartItem of cart) {
        const product = await this.productsRepository.findOne({
          where: { id: cartItem.productId },
        });

        // Vérifier si le produit a été trouvé
        if (product) {
          // Convertir la quantité du panier en nombre
          const quantity = Number(cartItem.quantity);
          // Ajouter le prix du produit multiplié par la quantité au prix total
          totalPrice += product.price * quantity;
          sheppindFeeItems += product.shippingFee * quantity;
          // Créer l'élément de commande
          await this.orderItemsRepository.save({
            quantity,
            orderId: orderDetail.id,
            productId: cartItem.productId,
            shippingFeeOrderTotal: sheppindFeeItems,
          });

          // await this._productService.decreaseProductQuantity(
          //   product.id,
          //   quantity,
          // );
        }
      }

      // Mettre à jour le prix de la commande
      orderDetail.price = totalPrice;

      // Enregistrer les modifications apportées à orderDetail
      await this.orderDetailsRepository.save(orderDetail);

      // Vider le panier
      await this._cartService.clearCart(userId);

      return { success: true, message: 'Order created successfully.' };
    } catch (error) {
      return {
        success: false,
        message: "Couldn't create an order.",
        error: error.message,
      };
    }
  }

  // Ramener tout
  async loadOrderDetails(
    orderId: number,
  ): Promise<OrderOutputDto | OrderOutputDto[]> {
    try {
      const prixTotal: number = 0;
      const shippingTotal: number = 0;
      const order = await this.orderDetailsRepository
        .createQueryBuilder('orderDetails')
        .leftJoinAndSelect('orderDetails.user', 'user')
        .leftJoinAndSelect('orderDetails.orders', 'orderItems')
        .leftJoinAndSelect('orderItems.product', 'product')
        .leftJoinAndSelect('product.seller', 'seller')
        .leftJoinAndSelect('product.images', 'images')
        .where('orderDetails.id = :orderId', { orderId })
        .orderBy('orderItems.createdAt', 'DESC')
        .getOne();

      if (!order) {
        return { success: false, error: 'Order not found' };
      }

      // Récupérer les images des produits to aws
      for (const orderItem of order.orders) {
        const product = orderItem.product;
        const imageKeys = product.images.map((image) => image.imageUrl);
        const imageUrls = await this._awsService.getFiles(imageKeys);
        product.images = product.images.map((image, index) => ({
          ...image,
          imageUrl: imageUrls[index],
        }));

        // Calcul des prix de OrderItems
        // orderItem.shippingFeeOrderTotal =
        //   product.shippingFee * orderItem.quantity;
        // orderItem.price = product.price * orderItem.quantity;
        // prixTotal += orderItem.price + orderItem.shippingFeeOrderTotal;
        // shippingTotal += orderItem.shippingFeeOrderTotal;
      }

      // calcul de prix de OrderDetail
      // order.price = prixTotal;
      // order.shippingFeeOrderDetailTotal = shippingTotal;

      return { success: true, item: order };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        error: error.message || 'Unknown error has occurred.',
      };
    }
  }

  async getAllProductsForOrder(orderId: number): Promise<Product[]> {
    const products = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoinAndSelect('product.orderItems', 'orderItem')
      .innerJoinAndSelect('orderItem.orderDetails', 'orderDetails')
      .where('orderDetails.id = :orderId', { orderId })
      .getMany();

    return products;
  }

  async listOrderByUser(userId: number): Promise<OrderOutputDto> {
    try {
      const orders = await this.orderDetailsRepository
        .createQueryBuilder('orderDetails')
        .leftJoinAndSelect('orderDetails.user', 'user')
        .leftJoinAndSelect('orderDetails.orders', 'orders')
        .leftJoinAndSelect('orders.product', 'product')
        .leftJoinAndSelect('product.images', 'images')
        .leftJoinAndSelect('product.seller', 'seller')
        .where('orderDetails.userId = :userId', { userId })
        .orderBy('orderDetails.updatedAt', 'DESC')
        .getMany();

      // Utiliser une assertion de type pour informer TypeScript de la structure attendue
      const typedOrders = orders as OrderDetails[];

      // Récupérer les images des produits depuis AWS
      for (const orderDetail of typedOrders) {
        const orderItems = orderDetail.orders as OrderItems[];
        for (const orderItem of orderItems) {
          const product = orderItem.product;
          const imageKeys = product.images.map((image) => image.imageUrl);
          const imageUrls = await this._awsService.getFiles(imageKeys);
          product.images = product.images.map((image, index) => ({
            ...image,
            imageUrl: imageUrls[index],
          }));

          // Calcul des prix de OrderItems
          orderItem.price = product.price * orderItem.quantity;
        }

        // Calculer les totaux pour OrderDetails
        const prixTotal = orderItems.reduce(
          (acc, orderItem) =>
            acc + (orderItem.price + orderItem.shippingFeeOrderTotal),
          0,
        );
        const shippingTotal = orderItems.reduce(
          (acc, orderItem) => acc + orderItem.shippingFeeOrderTotal,
          0,
        );

        // Attribuer les totaux calculés aux objets appropriés
        orderDetail.price = prixTotal;
        orderDetail.shippingFeeOrderDetailTotal = shippingTotal;
      }

      return { success: true, content: typedOrders };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Unknown error has occurred.',
      };
    }
  }

  async getAllOrdersBySeller(sellerId: number): Promise<OrderOutputDto> {
    try {
      const products = await this.productsRepository.find({
        where: { sellerID: sellerId },
      });

      const productIds = products.map((product) => product.id);

      const orders = await this.orderDetailsRepository
        .createQueryBuilder('orderDetails')
        .leftJoinAndSelect('orderDetails.user', 'user')
        .leftJoinAndSelect('orderDetails.orders', 'orderItems')
        .leftJoinAndSelect('orderItems.product', 'product')
        .leftJoinAndSelect('product.images', 'images')
        .leftJoinAndSelect('product.seller', 'seller')
        .where('product.sellerID=:sellerId', { sellerId })
        .where('orderItems.productId IN (:...productIds)', { productIds })
        .orderBy('orderItems.createdAt', 'DESC')
        .getMany();

      // Utiliser une assertion de type pour informer TypeScript de la structure attendue
      const typedOrders = orders as OrderDetails[];

      // Récupérer les images des produits depuis AWS
      for (const orderDetail of typedOrders) {
        const orderItems = orderDetail.orders as OrderItems[];
        for (const orderItem of orderItems) {
          const product = orderItem.product;
          const imageKeys = product.images.map((image) => image.imageUrl);
          const imageUrls = await this._awsService.getFiles(imageKeys);
          product.images = product.images.map((image, index) => ({
            ...image,
            imageUrl: imageUrls[index],
          }));

          // Calcul des prix de OrderItems
          orderItem.price = product.price * orderItem.quantity;
        }

        // Calculer les totaux pour OrderDetails
        const prixTotal = orderItems.reduce(
          (acc, orderItem) =>
            acc + (orderItem.price + orderItem.shippingFeeOrderTotal),
          0,
        );
        const shippingTotal = orderItems.reduce(
          (acc, orderItem) => acc + orderItem.shippingFeeOrderTotal,
          0,
        );

        // Attribuer les totaux calculés aux objets appropriés
        orderDetail.price = prixTotal;
        orderDetail.shippingFeeOrderDetailTotal = shippingTotal;
      }

      return { success: true, content: typedOrders };
    } catch (error) {
      console.error(error);
      throw new Error('Failed to retrieve orders');
    }
  }

  async getOneOrderBySeller(
    sellerId: number,
    orderId: number,
  ): Promise<OrderOutputDto | null> {
    try {
      const orderDetails = await this.orderDetailsRepository
        .createQueryBuilder('orderDetails')
        .leftJoinAndSelect('orderDetails.user', 'user')
        .leftJoinAndSelect('orderDetails.orders', 'orders')
        .leftJoinAndSelect('orders.product', 'product')
        .leftJoinAndSelect('product.images', 'images')
        .leftJoinAndSelect('product.seller', 'seller')
        .where('orderDetails.id = :orderId', { orderId })
        .andWhere('product.sellerID = :sellerId', { sellerId })
        .orderBy('orderDetails.updatedAt', 'DESC')
        .getOne();

      if (!orderDetails || !orderDetails.orders.length) {
        return null;
      }

      // Récupérer les images des produits depuis AWS
      for (const orderItem of orderDetails.orders) {
        const product = orderItem.product;
        const imageKeys = product.images.map((image) => image.imageUrl);
        const imageUrls = await this._awsService.getFiles(imageKeys);
        product.images = product.images.map((image, index) => ({
          ...image,
          imageUrl: imageUrls[index],
        }));

        // Calcul des prix de OrderItems
        orderItem.price = product.price * orderItem.quantity;
      }

      // Calculer les totaux pour OrderDetails
      const prixTotal = orderDetails.orders.reduce(
        (acc, orderItem) =>
          acc + (orderItem.price + orderItem.shippingFeeOrderTotal),
        0,
      );
      const shippingTotal = orderDetails.orders.reduce(
        (acc, orderItem) => acc + orderItem.shippingFeeOrderTotal,
        0,
      );

      // Attribuer les totaux calculés aux objets appropriés
      orderDetails.price = prixTotal;
      orderDetails.shippingFeeOrderDetailTotal = shippingTotal;

      return { success: true, item: orderDetails };
    } catch (error) {
      console.error(error);
      throw new Error('Failed to retrieve the order');
    }
  }

  async updateOneOrderBySeller(
    orderItemId: number,
    orderItemOfOrder: Partial<UpdateOrderByProductInputDto>,
  ) {
    const { status, shippingFeeOrderTotal } = orderItemOfOrder;

    // Récupérer l'article de commande
    const recupItemOrder = await this.orderItemsRepository.findOne({
      where: { id: orderItemId },
      relations: ['product'],
    });

    if (!recupItemOrder) {
      throw new Error('Order item not found');
    }

    recupItemOrder.status = status;
    recupItemOrder.shippingFeeOrderTotal = shippingFeeOrderTotal;

    if (recupItemOrder.status === OrderStatus.VALIDATED) {
      await this._productService.decreaseProductQuantity(
        recupItemOrder.product.id,
        recupItemOrder.quantity,
      );
    }

    const updatedItemOrder =
      await this.orderItemsRepository.save(recupItemOrder);

    console.log('Updated Item Order:', updatedItemOrder);
    return { success: true, content: updatedItemOrder };
  }

  // async updateOneOrderBySeller(
  //   orderItemId: number,
  //   orderItemOfOrder: Partial<UpdateOrderByProductInputDto>,
  // ) {
  //   const { status, shippingFeeOrderTotal } = orderItemOfOrder;
  //   const recupItemOrder = await this.orderItemsRepository.findOne({
  //     where: { id: orderItemId },
  //   });
  //
  //   recupItemOrder.status = status;
  //   recupItemOrder.shippingFeeOrderTotal = shippingFeeOrderTotal;
  //
  //   if (recupItemOrder.status === OrderStatus.VALIDATED) {
  //     await this._productService.decreaseProductQuantity(product.id, quantity);
  //   }
  //
  //   const updatedItemOder =
  //     await this.orderItemsRepository.save(recupItemOrder);
  //
  //   console.log('tt', recupItemOrder);
  //   console.log('yy', updatedItemOder);
  //   return { success: true, content: updatedItemOder };
  // }

  async listAllOrders(): Promise<OrderOutputDto> {
    try {
      const orders = await this.orderDetailsRepository
        .createQueryBuilder('orderDetails')
        .leftJoinAndSelect('orderDetails.user', 'user')
        .leftJoinAndSelect('orderDetails.orders', 'orders')
        .leftJoinAndSelect('orders.product', 'product')
        .leftJoinAndSelect('product.images', 'images')
        .leftJoinAndSelect('product.seller', 'seller')
        .orderBy('orderDetails.updatedAt', 'DESC')
        .getMany();

      const typedOrders = orders as OrderDetails[];

      // Récupérer les images des produits depuis AWS et calcul des prix
      for (const orderDetail of typedOrders) {
        const orderItems = orderDetail.orders as OrderItems[];
        for (const orderItem of orderItems) {
          const product = orderItem.product;
          const imageKeys = product.images.map((image) => image.imageUrl);
          const imageUrls = await this._awsService.getFiles(imageKeys);
          product.images = product.images.map((image, index) => ({
            ...image,
            imageUrl: imageUrls[index],
          }));

          // Calcul des prix de OrderItems
          orderItem.price = product.price * orderItem.quantity;
        }

        // Calculer les totaux pour OrderDetails
        const prixTotal = orderItems.reduce(
          (acc, orderItem) =>
            acc + (orderItem.price + orderItem.shippingFeeOrderTotal),
          0,
        );
        const shippingTotal = orderItems.reduce(
          (acc, orderItem) => acc + orderItem.shippingFeeOrderTotal,
          0,
        );

        // Attribuer les totaux calculés aux objets appropriés
        orderDetail.price = prixTotal;
        orderDetail.shippingFeeOrderDetailTotal = shippingTotal;
      }

      return { success: true, content: typedOrders };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Unknown error has occurred.',
      };
    }
  }

  private generateOrderReference(totalProductsCount: number): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const referenceSuffix = `${year}${month}${day}${hours}${minutes}-${totalProductsCount}`;
    return `CMD-${referenceSuffix}`;
  }
}
