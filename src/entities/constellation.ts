import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Banner } from './banner';

@Entity()
export class Constellation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character', length: 8 })
  uniqueId: string;

  @Column()
  name: string;

  @Column()
  count: number;

  @ManyToOne(type => Banner, banner => banner.wishes, { nullable: true })
  banner: Banner;
}
