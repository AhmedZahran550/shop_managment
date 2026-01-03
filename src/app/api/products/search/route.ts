import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) return NextResponse.json({ data: [] });

  try {
    const res = await query(
      "SELECT * FROM products WHERE name ILIKE $1 OR size ILIKE $1",
      [`%${q}%`]
    );
    return NextResponse.json({ data: res.rows });
  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
