import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");
    const sort = searchParams.get("sort") || "recent";

    // Revised approach for this block:
    const dbParams: any[] = [];
    const dbWhere: string[] = [];
    let pIdx = 1;

    if (search) {
      dbWhere.push(`name ILIKE $${pIdx}`);
      dbParams.push(`%${search}%`);
      pIdx++;
    }
    if (categoryId) {
      dbWhere.push(`category_id = $${pIdx}`);
      dbParams.push(categoryId);
      pIdx++;
    }

    const whereStr =
      dbWhere.length > 0 ? " WHERE " + dbWhere.join(" AND ") : "";

    // Data query needs limit as the last param
    const dataParams = [...dbParams, limit];
    const limitIdx = "$" + (dbParams.length + 1);

    const fullDataQuery = `SELECT * FROM products${whereStr} ORDER BY ${
      sort === "price_asc"
        ? "selling_price ASC"
        : sort === "price_desc"
        ? "selling_price DESC"
        : "created_at DESC"
    } LIMIT ${limitIdx}`;

    const fullCountQuery = `SELECT COUNT(*) FROM products${whereStr}`;

    const res = await query(fullDataQuery, dataParams);
    const totalRes = await query(fullCountQuery, dbParams);

    return NextResponse.json({
      data: res.rows,
      pagination: {
        total: parseInt(totalRes.rows[0].count),
      },
    });
  } catch (error) {
    console.error("Products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
