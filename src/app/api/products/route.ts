import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Product } from "@/entities/Product";
import { ILike } from "typeorm";
import { getCurrentUser } from "@/lib/server-auth";
import { logActivity } from "@/lib/activity-logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");
    const sort = searchParams.get("sort") || "recent";

    const dataSource = await getDataSource();
    const productRepo = dataSource.getRepository(Product);

    let query = productRepo
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category");

    // PostgreSQL full-text search using tsvector
    // Searches across: product name, size, weight, and category name
    if (search && search.trim()) {
      query = query.where(
        "product.search_vector @@ plainto_tsquery('simple', :search)",
        { search: search.trim() }
      );
    }

    // Filter by category
    if (categoryId) {
      if (search && search.trim()) {
        query = query.andWhere("product.category_id = :categoryId", {
          categoryId,
        });
      } else {
        query = query.where("product.category_id = :categoryId", {
          categoryId,
        });
      }
    }

    // Sorting
    switch (sort) {
      case "price_asc":
        query = query.orderBy("product.selling_price", "ASC");
        break;
      case "price_desc":
        query = query.orderBy("product.selling_price", "DESC");
        break;
      case "recent":
      default:
        query = query.orderBy("product.created_at", "DESC");
        break;
    }

    const [products, total] = await query.take(limit).getManyAndCount();

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

export async function POST(request: Request) {
  try {
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

    let imageUrl = "";

    if (image) {
      // Upload to Cloudinary
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
            imageUrl = result?.secure_url || "";
            resolve(result);
          })
          .end(buffer);
      });
    }

    const dataSource = await getDataSource();
    const productRepo = dataSource.getRepository(Product);

    const newProduct = productRepo.create({
      name,
      category_id: categoryId,
      base_price: parseFloat(basePrice),
      selling_price: parseFloat(sellingPrice),
      image_url: imageUrl,
      size: size ? (size as "small" | "medium" | "large") : undefined,
      weight: weight || undefined,
    });

    await productRepo.save(newProduct);

    // Log activity
    await logActivity(
      user.userId,
      "created product",
      "product",
      newProduct.id,
      { name: newProduct.name }
    );

    return NextResponse.json(
      {
        data: newProduct,
        message: "Product created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product", details: error.message },
      { status: 500 }
    );
  }
}
