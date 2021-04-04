import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export type ReminderType = 'transformer' | 'hoyolab';

@Entity()
export class Reminder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('timestamptz')
  time: string;

  @Column()
  token: string;

  @Column({
    type: 'enum',
    enum: ['transformer', 'hoyolab'],
  })
  type: ReminderType;
}
