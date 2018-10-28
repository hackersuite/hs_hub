import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { User } from "./";

@Entity()
export class AchievementProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  achievementId: string;

  @ManyToOne(type => User, user => user.achievementsProgress)
  user: User;
}