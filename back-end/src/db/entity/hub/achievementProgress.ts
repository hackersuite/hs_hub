import { Entity, ManyToOne, PrimaryColumn, Column, CreateDateColumn } from "typeorm";
import { User } from "./";

@Entity()
export class AchievementProgress {
  @PrimaryColumn()
  achievementId: string;

  @Column({
    nullable: false
  })
  progress: number;

  @ManyToOne(type => User, user => user.achievementsProgress, {
    primary: true
  })
  user: User;
}