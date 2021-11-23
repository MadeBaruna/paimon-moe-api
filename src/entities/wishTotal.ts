import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class WishTotal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character', length: 8 })
  uniqueId: string;

  @Column()
  total: number;

  @Column()
  bannerType: string;
}
