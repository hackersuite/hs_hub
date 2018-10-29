import { Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./";

@Entity()
export class AchievementProgress {
  @PrimaryColumn()
  achievementId: string;

  @PrimaryColumn()
  progress: number;

  @ManyToOne(type => User, user => user.achievementsProgress)
  user: User;
}