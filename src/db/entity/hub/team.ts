import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from "typeorm";
import { User } from ".";

@Entity()
export class Team {
  @PrimaryGeneratedColumn("uuid")
  teamCode: string;

  @Column({ nullable: true })
  repo: string;

  @Column({ nullable: true })
  tableNumber: number;

  @OneToMany(() => User, user => user.team)
  users: User[];
}