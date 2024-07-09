import { CoreEntity } from 'src/common/entities/core.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Address extends CoreEntity {
  @Column({ nullable: true })
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  // @Column()
  // userId: number;

  @ManyToOne(() => User, (user) => user.address)
  @JoinColumn({ name: 'userId' })
  user: User;
}
