import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 128 })
  name: string;

  @Column("varchar", { length: 255 })
  email: string;

  @Column("varchar", { length: 255 })
  password: string;

  @Column("int")
  authLevel: number;

  @Column("varchar", { length: 13 })
  teamCode: string;

  @Column()
  repo: string;
}