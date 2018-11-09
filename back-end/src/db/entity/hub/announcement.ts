import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity ()
export class Announcement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  createdAt: number;

  @Column("varchar", { length: 255 })
  message: string;

  /**
   * Creates new Annnouncement object
   * @param message The announcement's message
   */
  constructor(message) {
    this.createdAt = Date.now();
    this.message = message;
  }
}