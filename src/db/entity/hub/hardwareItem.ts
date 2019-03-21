import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ReservedHardwareItem } from "./reservedHardwareItem";
import { IsUrl, IsString, IsNumber } from "class-validator";

@Entity()
export class HardwareItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 255, nullable: false, unique: true })
  @IsString()
  name: string;

  @Column()
  @IsNumber()
  totalStock: number;

  @Column()
  @IsNumber()
  reservedStock: number;

  @Column()
  @IsNumber()
  takenStock: number;

  @Column("varchar", { length: 1024 })
  @IsUrl()
  itemURL: string;

  @OneToMany(() => ReservedHardwareItem, reservedHardwareItem => reservedHardwareItem.hardwareItem)
  reservations: ReservedHardwareItem[];
}