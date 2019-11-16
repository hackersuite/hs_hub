import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Cacheable } from "../../util/cache";
import { IsDefined, MaxLength } from "class-validator";

@Entity()
export class Challenge implements Cacheable {
  @PrimaryGeneratedColumn()
  id: number;

  @IsDefined({ message: "The title must be defined" })
  @MaxLength(128)
  @Column("varchar", { length: 128 })
  title: string;

  @IsDefined({ message: "The description must be defined" })
  @MaxLength(500)
  @Column("varchar", { length: 500 })
  description: string;

  @IsDefined({ message: "The company must be defined" })
  @MaxLength(128)
  @Column("varchar", { length: 128 })
  company: string;

  @MaxLength(255)
  @Column("varchar", { length: 255 })
  prizes: string;

  // Expires in one minute
  expiresIn: number = 60000;

  constructor(title: string, description: string, company: string, prizes: string) {
    this.title = title;
    this.description = description;
    this.company = company;
    this.prizes = prizes;
  }
}