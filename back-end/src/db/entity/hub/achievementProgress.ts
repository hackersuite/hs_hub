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

  @Column({
    type: "varchar",
    length: "127",
    nullable: false
  })
  stepsCompleted: string;

  constructor(achievementId: string, user: User, progress?: number, stepsCompleted?: string) {
    this.achievementId = achievementId;
    this.user = user;
    this.progress = progress || 0;
    this.stepsCompleted = stepsCompleted || "";
  }
}