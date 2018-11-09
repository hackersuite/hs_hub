import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: string;

  @Column("varchar", {length : 127})
  title: string;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column("varchar", {length: 127})
  location: string;
}