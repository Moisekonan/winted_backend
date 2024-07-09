import { CoreEntity } from 'src/common/entities/core.entity';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class NewsletterSubscription extends CoreEntity {
  @Column()
  email: string;
}
