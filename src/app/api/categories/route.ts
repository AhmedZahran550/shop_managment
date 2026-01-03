import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Category } from "@/entities/Category";

export async function GET() {
  try {
    const dataSource = await getDataSource();
    const categoryRepo = dataSource.getRepository(Category);
    const categories = await categoryRepo.find();
    return NextResponse.json({ data: categories });
  } catch (error: any) {
    console.error("Categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories", details: error.message },
      { status: 500 }
    );
  }
}
