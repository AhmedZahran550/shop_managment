import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity("activities")
export class Activity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id" })
  user_id!: string;

  @Column()
  action!: string;

  @Column("jsonb", { nullable: true })
  details!: any;

  @Column({ nullable: true })
  entity_type!: string;

  @Column("uuid", { nullable: true })
  entity_id!: string;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;
}
