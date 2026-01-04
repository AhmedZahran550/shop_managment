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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const categoryId = formData.get("categoryId") as string;
    const basePrice = formData.get("basePrice") as string;
    const sellingPrice = formData.get("sellingPrice") as string;
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
    });

    await productRepo.save(newProduct);

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
