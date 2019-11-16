import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { AchievementProgress } from "./achievementProgress";
import { ReservedHardwareItem } from "./reservedHardwareItem";

/**
 * A class to store the user entity in the database
 */
@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar")
  name: string;

  @Column("varchar", { unique: true })
  authId: string;

  @Column("simple-array", { nullable: true })
  push_id: string[];

  /**
   * Every user is able to have many different achievements so create a typeorm relationship
   */
  @OneToMany(type => AchievementProgress, aProgress => aProgress.user)
  achievementsProgress: AchievementProgress;

  /**
   * Also, users are able to reserve many different hardware items
   */
  @OneToMany(() => ReservedHardwareItem, reservedHardwareItem => reservedHardwareItem.user)
  hardwareItems: ReservedHardwareItem[];

  public getId() {
    return this.id;
  }

  public getName() {
    return this.name;
  }
}