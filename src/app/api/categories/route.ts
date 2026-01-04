import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Category } from "@/entities/Category";
import { getCurrentUser } from "@/lib/server-auth";
import { logActivity } from "@/lib/activity-logger";

export async function GET() {
  try {
    const dataSource = await getDataSource();
    const categoryRepo = dataSource.getRepository(Category);
    const categories = await categoryRepo.find({
      order: { created_at: "DESC" },
    });
    return NextResponse.json({ data: categories });
  } catch (error: any) {
    console.error("Categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const categoryRepo = dataSource.getRepository(Category);

    // Check availability
    const existing = await categoryRepo.findOne({ where: { name } });
    if (existing) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 409 }
      );
    }

    const newCategory = categoryRepo.create({ name });
    await categoryRepo.save(newCategory);

    await logActivity(
      user.userId,
      "CREATED_CATEGORY",
      "Category",
      newCategory.id,
      { name }
    );

    return NextResponse.json({ data: newCategory }, { status: 201 });
  } catch (error: any) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "Failed to create category", details: error.message },
      { status: 500 }
    );
  }
}
