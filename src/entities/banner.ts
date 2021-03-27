import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Pull } from './pull';
import { Wish } from './wish';

export type BannerType = 'beginners' | 'standard' | 'characters' | 'weapons';

@Entity()
export class Banner {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ['beginners', 'standard', 'characters', 'weapons'],
  })
  type: BannerType;

  @Column('timestamptz')
  start: string;

  @Column('timestamptz')
  end: string;

  @OneToMany(type => Wish, wish => wish.banner)
  wishes: Wish[];

  @OneToMany(type => Pull, pull => pull.banner)
  pulls: Pull[];
}
