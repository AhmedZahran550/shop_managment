import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Category } from "./Category";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ name: "category_id", nullable: true })
  category_id!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  base_price!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  selling_price!: number;

  @Column({ nullable: true })
  image_url!: string;

  @Column("tsvector", { select: false, nullable: true })
  search_vector!: any;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: "category_id" })
  category!: Category;
}
