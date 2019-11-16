import { Entity, Column, ManyToOne } from "typeorm";
import { HardwareItem } from "./hardwareItem";
import { User } from "./user";

@Entity()
export class ReservedHardwareItem {
  @ManyToOne(() => User, { primary: true })
  user: User;

  @ManyToOne(() => HardwareItem, { primary: true })
  hardwareItem: HardwareItem;

  @Column()
  isReserved: boolean;

  @Column("varchar", { unique: true })
  reservationToken: string;

  @Column("datetime")
  reservationExpiry: Date;

  @Column()
  reservationQuantity: number;
}