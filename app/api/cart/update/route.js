import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";

export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { cartData } = await request.json();

    if (!cartData || typeof cartData !== "object" || Array.isArray(cartData)) {
      return NextResponse.json(
        { success: false, message: "Invalid cart data." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found in database." },
        { status: 404 }
      );
    }

    user.cartItem = cartData;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Cart updated successfully.",
    });
  } catch (error) {
    console.error("POST /api/cart/update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update cart.",
      },
      { status: 500 }
    );
  }
}