import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";

import { NextResponse } from "next/server";
import User from "../../../../models/User";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    await connectDB();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found!" });
    }
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
