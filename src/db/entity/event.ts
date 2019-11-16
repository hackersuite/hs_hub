import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Cacheable } from "../../util/cache";
import { IsDefined, MaxLength, IsDate } from "class-validator";

@Entity()
export class Event implements Cacheable {
  @PrimaryGeneratedColumn()
  id: number;

  @IsDefined({ message: "The title must be defined" })
  @MaxLength(127)
  @Column("varchar", {length : 127})
  title: string;

  @IsDefined({ message: "The start time must be defined" })
  @IsDate()
  @Column()
  startTime: Date;

  @Column()
  @IsDate()
  endTime: Date;

  @Column("varchar", {length: 127})
  location: string;

  // The lifetime of this object in the cache is 10 seconds
  expiresIn: number = 10000;

  constructor(title: string, startTime: Date, endTime: Date, location: string) {
    this.title = title;
    this.startTime = startTime;
    this.endTime = endTime;
    this.location = location;
  }
}