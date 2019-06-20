import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { AchievementProgress } from "./achievementProgress";
import { ReservedHardwareItem } from "./reservedHardwareItem";
import { Team } from "./";

/**
 * A class to store the user entity in the database
 */
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 128 })
  name: string;

  @Column("varchar", { length: 255, unique: true })
  email: string;

  @Column("varchar", { length: 255, select: false })
  password: string;

  @Column()
  authLevel: number;

  /**
   * Each user can only be in one team at a time, they are allowed to be in no team
   */
  @ManyToOne(() => Team, team => team.users, { nullable: true })
  team: Team;

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