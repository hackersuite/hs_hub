import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity ()
export class Challenge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 128 })
  title: string;

  @Column("varchar", { length: 500 })
  description: string;

  @Column("varchar", { length: 128 })
  company: string;

  @Column("varchar", { length: 255 })
  prizes: string;
}