import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: "user_user"
})
export class ApplicationUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 128 })
  password: string;

  @Column("timestamp with time zone")
  last_login: string;

  @Column("varchar", { length: 255 })
  email: string;

  @Column("varchar", { length: 255 })
  name: string;

  @Column("boolean")
  email_verified: boolean;

  @Column("boolean")
  is_active: boolean;

  @Column("boolean")
  is_volunteer: boolean;

  @Column("boolean")
  is_organizer: boolean;

  @Column("boolean")
  is_director: boolean;

  @Column("boolean")
  is_admin: boolean;

  @Column("boolean")
  is_hardware_admin: boolean;

  @Column("timestamp with time zone")
  created_time: string;
}