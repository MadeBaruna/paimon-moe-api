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

  @Column({ type: 'float', nullable: true })
  legendaryWinRateOff: number;

  @Column({ type: 'float', nullable: true })
  rareWinRateOff: number;

  @Column({ nullable: true })
  legendaryMaxStreak: number;

  @Column({ nullable: true })
  rareMaxStreak: number;
}
