import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ReservedHardwareItem } from "./reservedHardwareItem";

@Entity()
export class HardwareItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 255, nullable: false, unique: true })
  name: string;

  @Column("varchar", { length: 255 })
  description: string;

  @Column()
  totalStock: number;

  @Column()
  reservedStock: number;

  @Column()
  takenStock: number;

  @Column("varchar", { length: 1024 })
  itemURL: string;

  @OneToMany(() => ReservedHardwareItem, reservedHardwareItem => reservedHardwareItem.hardwareItem)
  reservedHardwareItem: ReservedHardwareItem[];
}