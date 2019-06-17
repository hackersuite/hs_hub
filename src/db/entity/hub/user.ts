import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { AchievementProgress } from "./achievementProgress";
import { ReservedHardwareItem } from "./reservedHardwareItem";
import { IsDefined, IsString, IsEmail, IsNumber, IsArray, Max } from "class-validator";

/**
 * A class to store the user entity in the database
 */
@Entity()
export class User {
  constructor(name?: string, email?: string, password?: string, id?: number,
              authLevel?: number, team?: string, pushId?: string[]) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.authLevel = authLevel;
    this.team = team;
    this.push_id = pushId;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @IsDefined({ message: "The name must be defined" })
  @Column("varchar", { length: 128, nullable: false })
  @IsString()
  name: string;

  @IsDefined({ message: "The email must be defined" })
  @Column("varchar", { length: 255, nullable: false, unique: true })
  @IsEmail(undefined, { message: "The email must have a valid format for an email adress" })
  @IsString()
  email: string;

  @IsDefined({ message: "The password must be defined" })
  @Column("varchar", { length: 255, nullable: false, select: false })
  @IsString()
  password: string;

  @Column()
  authLevel: number;

  @Column("varchar", { length: 13, nullable: true })
  team: string;

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
}