import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Product } from "@/entities/Product";
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

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const categoryId = formData.get("categoryId") as string;
    const basePrice = formData.get("basePrice") as string;
    const sellingPrice = formData.get("sellingPrice") as string;
    const size = formData.get("size") as string;
    const weight = formData.get("weight") as string;
    const image = formData.get("image") as File | null;

    if (!name || !categoryId || !basePrice || !sellingPrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const dataSource = await getDataSource();
    const productRepo = dataSource.getRepository(Product);

    const product = await productRepo.findOne({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let imageUrl = product.image_url;

    if (image && image.size > 0) {
      // Upload new image to Cloudinary
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const cloudinary = (await import("@/lib/cloudinary")).default;

      await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "shop-products" }, (error, result) => {
            if (error) {
              reject(error);
              return;
            }
            imageUrl = result?.secure_url || imageUrl;
            resolve(result);
          })
          .end(buffer);
      });
    }

    const oldData = { ...product };
    product.name = name;
    product.category_id = categoryId;
    product.base_price = parseFloat(basePrice);
    product.selling_price = parseFloat(sellingPrice);
    product.image_url = imageUrl;
    product.size = size ? (size as "صغير" | "متوسط" | "كبير") : undefined;
    product.weight = weight || undefined;

    await productRepo.save(product);

    await logActivity(user.userId, "updated product", "product", product.id, {
      oldName: oldData.name,
      newName: product.name,
    });

    return NextResponse.json({
      data: product,
      message: "Product updated successfully",
    });
  } catch (error: any) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: "Failed to update product", details: error.message },
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
    const productRepo = dataSource.getRepository(Product);

    const product = await productRepo.findOne({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const productName = product.name;
    await productRepo.remove(product);

    await logActivity(user.userId, "deleted product", "product", id, {
      name: productName,
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "Failed to delete product", details: error.message },
      { status: 500 }
    );
  }
}
