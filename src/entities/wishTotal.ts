import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class WishTotal {
  @PrimaryColumn({ type: 'character', length: 8 })
  uniqueId: string;

  @PrimaryColumn()
  bannerType: string;

  @Column()
  total: number;

  @Column()
  legendary: number;

  @Column()
  rare: number;

  @Column({ type: 'float' })
  legendaryPercentage: number;

  @Column({ type: 'float' })
  rarePercentage: number;
}
