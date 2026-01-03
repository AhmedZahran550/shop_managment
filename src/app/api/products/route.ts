import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";

    const res = await query("SELECT * FROM products LIMIT $1", [limit]);
    const totalRes = await query("SELECT COUNT(*) FROM products");

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
