import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: "teams_team"
})
export class ApplicationTeam {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 13 })
  team_code: string;

  @Column()
  user_id: number;
}