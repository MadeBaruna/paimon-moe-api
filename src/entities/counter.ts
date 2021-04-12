import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Counter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('timestamptz')
  time: string;

  @Column({ default: '' })
  digits: string;

  @Column()
  lastId: string;
}
