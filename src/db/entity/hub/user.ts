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

  @OneToMany(type => AchievementProgress, aProgress => aProgress.user)
  achievementsProgress: AchievementProgress;
  @OneToMany(() => ReservedHardwareItem, reservedHardwareItem => reservedHardwareItem.user)
  hardwareItems: ReservedHardwareItem[];

  convertToUser(appUser: ApplicationUser): void {
    this.id = appUser.id;
    this.name = appUser.name;
    this.email = appUser.email;
    this.password = appUser.password;
    this.authLevel = getAuthLevel(appUser.is_organizer, appUser.is_volunteer);
    this.team = appUser.teamCode;
    this.repo = "";
  }
}