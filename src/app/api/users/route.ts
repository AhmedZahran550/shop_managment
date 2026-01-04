import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { User } from "@/entities/User";
import { getCurrentUser } from "@/lib/server-auth";
import { logActivity } from "@/lib/activity-logger";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { username, password, role } = await request.json();

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: "Username, password, and role are required" },
        { status: 400 }
      );
    }

    if (!["admin", "worker"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'admin' or 'worker'" },
        { status: 400 }
      );
    }

    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);

    const existing = await userRepo.findOne({ where: { username } });
    if (existing) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = userRepo.create({
      username,
      password: hashedPassword,
      role,
    });

    await userRepo.save(newUser);

    await logActivity(user.userId, "CREATED_USER", "User", newUser.id, {
      username,
      role,
    });

    // Return user without password
    const { password: _, ...userWithoutPass } = newUser;

    return NextResponse.json({ data: userWithoutPass }, { status: 201 });
  } catch (error: any) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Failed to create user", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);
    const users = await userRepo.find({
      order: { created_at: "DESC" },
    });

    const safeUsers = users.map((u) => {
      const { password, ...rest } = u;
      return rest;
    });

    return NextResponse.json({ data: safeUsers });
  } catch (error: any) {
    console.error("Fetch users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users", details: error.message },
      { status: 500 }
    );
  }
}
