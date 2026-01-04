import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Category } from "@/entities/Category";
import { getCurrentUser } from "@/lib/server-auth";
import { logActivity } from "@/lib/activity-logger";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "worker")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const categoryRepo = dataSource.getRepository(Category);

    const category = await categoryRepo.findOne({ where: { id } });
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const oldName = category.name;
    category.name = name;
    await categoryRepo.save(category);

    await logActivity(
      user.userId,
      "UPDATED_CATEGORY",
      "Category",
      category.id,
      { oldName, newName: name }
    );

    return NextResponse.json({ data: category });
  } catch (error: any) {
    console.error("Update category error:", error);
    return NextResponse.json(
      { error: "Failed to update category", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "worker")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const dataSource = await getDataSource();
    const categoryRepo = dataSource.getRepository(Category);

    const category = await categoryRepo.findOne({
      where: { id },
      relations: ["products"],
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (category.products && category.products.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with associated products" },
        { status: 400 }
      );
    }

    await categoryRepo.remove(category);

    await logActivity(user.userId, "DELETED_CATEGORY", "Category", id, {
      name: category.name,
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { error: "Failed to delete category", details: error.message },
      { status: 500 }
    );
  }
}
