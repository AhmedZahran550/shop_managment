import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Product } from "@/entities/Product";
import { ILike } from "typeorm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");
    const sort = searchParams.get("sort") || "recent";

    const dataSource = await getDataSource();
    const productRepo = dataSource.getRepository(Product);

    const where: any = {};
    if (search) {
      where.name = ILike(`%${search}%`);
    }
    if (categoryId) {
      where.category_id = categoryId;
    }

    const order: any = {};
    switch (sort) {
      case "price_asc":
        order.selling_price = "ASC";
        break;
      case "price_desc":
        order.selling_price = "DESC";
        break;
      case "recent":
      default:
        order.created_at = "DESC";
        break;
    }

    const [products, total] = await productRepo.findAndCount({
      where,
      order,
      take: limit,
    });

    return NextResponse.json({
      data: products,
      pagination: {
        total,
      },
    });
  } catch (error) {
    console.error("Products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products", details: (error as any).message },
      { status: 500 }
    );
  }
}
