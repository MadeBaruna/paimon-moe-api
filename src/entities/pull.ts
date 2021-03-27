import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Banner } from './banner';
import { Wish } from './wish';

export type ItemType = 'character' | 'weapon';

@Entity()
export class Pull {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('timestamptz')
  time: string;

  @Column()
  name: string;

  @Column('smallint')
  pity: number;

  @Column({
    type: 'enum',
    enum: ['character', 'weapon'],
  })
  type: ItemType;

  @Column()
  grouped: boolean;

  @ManyToOne(type => Wish, wish => wish.pulls, {
    onDelete: 'CASCADE',
  })
  wish: Wish;

  @ManyToOne(type => Banner, banner => banner.pulls)
  banner: Banner;
}
