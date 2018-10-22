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

  @Column("json")
  authLevel: any;

  @Column("varchar", { length: 13 })
  team: string;

  @Column()
  repo: string;
}