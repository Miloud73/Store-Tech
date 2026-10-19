import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";

export async function POST(request) {
  try {
    const { userId } = auth(request);
    const { cartData } = await request.json();

    await connectDB();

    const user = await User.findById(userId);
    user.cartItem = cartData;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Cart updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
