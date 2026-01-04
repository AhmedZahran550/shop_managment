import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { Product } from "./Product";

import { ShopCategory } from "@/lib/constants/categories";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "enum",
    enum: ShopCategory,
    unique: true,
  })
  name!: ShopCategory;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];
}
