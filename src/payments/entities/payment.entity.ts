import { CoreEntity } from 'src/common/entities/core.entity';
import { OrderDetails } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Payment extends CoreEntity {
  @Column()
  paymentType: string;

  @Column()
  accountNumber: string;

  @Column()
  expire: string;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.carts)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => OrderDetails, (order) => order.payment)
  orders: OrderDetails[];
}
