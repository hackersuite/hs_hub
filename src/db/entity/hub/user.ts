import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { AchievementProgress } from "./achievementProgress";
import { ReservedHardwareItem } from "./reservedHardwareItem";
import { AuthLevels } from "../../../util/user/authLevels";
import { ApplicationUser } from "../applications";

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

  @OneToMany(type => AchievementProgress, aProgress => aProgress.user)
  achievementsProgress: AchievementProgress;
  @OneToMany(() => ReservedHardwareItem, reservedHardwareItem => reservedHardwareItem.user)
  hardwareItems: ReservedHardwareItem[];

  constructor(id: number, name: string, email: string, password: string, authLevel: AuthLevels, team: string, repo: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.authLevel = authLevel;
    this.team = team;
    this.repo = repo;
  }
}