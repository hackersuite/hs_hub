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
  @OneToMany((type) => AchievementProgress, (aProgress) => aProgress.user)
  achievementsProgress: AchievementProgress;

  /**
   * Also, users are able to reserve many different hardware items
   */
  @OneToMany(() => ReservedHardwareItem, (reservedHardwareItem) => reservedHardwareItem.user)
  hardwareItems: ReservedHardwareItem[];

  @Column("boolean", { default: false })
  completed_intro: boolean;

  @Column("varchar", { nullable: true })
  phone: string;

  @Column("varchar", { nullable: true })
  university: string;

  @Column("varchar", { nullable: true })
  addr1: string;

  @Column("varchar", { nullable: true })
  addr2: string;

  @Column("varchar", { nullable: true })
  addr3: string;

  @Column("varchar", { nullable: true })
  country: string;

  @Column("varchar", { nullable: true })
  spr: string;

  @Column("varchar", { nullable: true })
  city: string;

  @Column("varchar", { nullable: true })
  zip: string;

  @Column("varchar", { nullable: true })
  tshirt: string;

  @Column("varchar", { nullable: true })
  sex: string;

  public getId() {
    return this.id;
  }

  public getName() {
    return this.name;
  }
}
