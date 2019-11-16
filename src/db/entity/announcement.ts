import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Cacheable } from "../../util/cache";
import { MaxLength, IsDefined } from "class-validator";

@Entity ()
export class Announcement implements Cacheable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  createdAt: string;

  @IsDefined({ message: "Message must de defined." })
  @MaxLength(255, { message: "Message must be at most 255 characters." })
  @Column("varchar", { length: 255 })
  message: string;

  // Expires in 5 minutes
  expiresIn: number = 60000;

  /**
   * Creates new Annnouncement object
   * @param message The announcement's message
   */
  constructor(message: string) {
    this.createdAt = String(Date.now());
    this.message = message;
  }
}