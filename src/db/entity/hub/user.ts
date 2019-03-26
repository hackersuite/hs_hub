import { Entity, Column, PrimaryGeneratedColumn, OneToMany, AfterUpdate } from "typeorm";
import { AchievementProgress } from "./achievementProgress";
import { ReservedHardwareItem } from "./reservedHardwareItem";

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

  @Column("varchar", { length: 13, nullable: true })
  team: string;

  @Column("varchar", { length: 36, nullable: true })
  push_id: string;

  @OneToMany(type => AchievementProgress, aProgress => aProgress.user)
  achievementsProgress: AchievementProgress;
  @OneToMany(() => ReservedHardwareItem, reservedHardwareItem => reservedHardwareItem.user)
  hardwareItems: ReservedHardwareItem[];

  public getId() {
    return this.id;
  }

  public getName() {
    return this.name;
  }
}