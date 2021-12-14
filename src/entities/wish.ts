import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, Index } from 'typeorm';
import { Banner } from './banner';
import { Pull } from './pull';

export type ItemType = 'character' | 'weapon';

@Entity()
export class Wish {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'character', length: 8 })
  uniqueId: string;

  @Column('smallint', { array: true, default: '{}' })
  pityCount: number[];

  @Column('smallint', { array: true })
  rarePity: number[];

  @Column()
  total: number;

  @Column()
  rare: number;

  @Column()
  legendary: number;

  @OneToMany(type => Pull, pull => pull.wish, {
    cascade: true,
  })
  pulls: Pull[];

  @ManyToOne(type => Banner, banner => banner.wishes)
  banner: Banner;
}
