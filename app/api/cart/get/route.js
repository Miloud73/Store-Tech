import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";
export async function GET(request) {
  try {
    const { userId } = auth(request);

    await connectDB();

    const user = await User.findById(userId);
    const cartItems = user.cart;

    return NextResponse(
      JSON.stringify({ success: true, data: cartItems }),
      { status: 200 }
    );

  } catch (error) {
    return NextResponse(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500 }
    );
  }
}
