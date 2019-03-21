import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ReservedHardwareItem } from "./reservedHardwareItem";
import { IsUrl, IsString, IsNumber, IsDefined } from "class-validator";

@Entity()
export class HardwareItem {
  @PrimaryGeneratedColumn()
  id: number;

  @IsDefined({ message: "The name must be defined" })
  @Column("varchar", { length: 255, nullable: false, unique: true })
  @IsString()
  name: string;

  @IsDefined({ message: "The total stock must be defined" })
  @Column()
  @IsNumber()
  totalStock: number;

  @Column()
  @IsNumber()
  reservedStock: number;

  @IsNumber()
  @Column()
  takenStock: number;

  @IsDefined({ message: "The item URL must be defined" })
  @IsUrl()
  @Column("varchar", { length: 1024 })
  itemURL: string;

  @OneToMany(() => ReservedHardwareItem, reservedHardwareItem => reservedHardwareItem.hardwareItem)
  reservations: ReservedHardwareItem[];
}