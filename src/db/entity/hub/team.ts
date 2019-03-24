import { Entity, Column, PrimaryColumn, AfterInsert, AfterUpdate } from "typeorm";

@Entity()
export class Team {
  @PrimaryColumn("varchar", { length: 13 })
  teamCode: string;

  @Column({ nullable: true })
  repo: string;
}