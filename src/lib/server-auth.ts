import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_dev_secret_key_123";

export interface DecodedUser {
  userId: string;
  username: string;
  role: string;
}

export async function getCurrentUser(): Promise<DecodedUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedUser;
    return decoded;
  } catch (error) {
    return null;
  }
}
