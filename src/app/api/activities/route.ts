import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Activity } from "@/entities/Activity";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const dataSource = await getDataSource();
    const activityRepo = dataSource.getRepository(Activity);

    const [activities, total] = await activityRepo.findAndCount({
      order: { created_at: "DESC" },
      take: limit,
    });

    return NextResponse.json({
      data: activities,
      pagination: {
        total,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch activities", details: error.message },
      { status: 500 }
    );
  }
}
