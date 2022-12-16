import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Deck {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  name: string;

  @Column('json')
  deck: string;

  @Column()
  views: number;

  @Column('timestamptz')
  time: string;
}
