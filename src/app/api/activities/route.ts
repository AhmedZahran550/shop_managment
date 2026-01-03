import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "10";

    // Fetch activities properly ordered
    // Note: Assuming table exists as per schema
    const res = await query(
      "SELECT * FROM activities ORDER BY created_at DESC LIMIT $1",
      [limit]
    );
    const totalRes = await query("SELECT COUNT(*) FROM activities");

    return NextResponse.json({
      data: res.rows,
      pagination: {
        total: parseInt(totalRes.rows[0].count),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
