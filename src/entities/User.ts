import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ select: false }) // Hide password by default
  password!: string;

  @Column({ default: "employee" })
  role!: string;

  @CreateDateColumn()
  created_at!: Date;
}
