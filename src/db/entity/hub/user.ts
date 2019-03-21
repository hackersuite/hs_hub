import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { AchievementProgress } from "./achievementProgress";
import { ReservedHardwareItem } from "./reservedHardwareItem";
import { ApplicationUser } from "../applications/applicationUser";
import { getAuthLevel } from "../../../util/user/authLevels";

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

  @Column()
  authLevel: number;

  @Column("varchar", { length: 13 })
  team: string;

  @Column()
  repo: string;

  @Column("varchar", { length: 36})
  push_id: string;

  @OneToMany(type => AchievementProgress, aProgress => aProgress.user)
  achievementsProgress: AchievementProgress;
  @OneToMany(() => ReservedHardwareItem, reservedHardwareItem => reservedHardwareItem.user)
  hardwareItems: ReservedHardwareItem[];
}