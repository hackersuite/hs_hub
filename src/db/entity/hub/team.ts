import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class Team {
  @PrimaryColumn("varchar", { length: 13 })
  teamCode: string;

  @Column({ nullable: true })
  repo: string;

  @Column({ nullable: true })
  tableNumber: number;
}