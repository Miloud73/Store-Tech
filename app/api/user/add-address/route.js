import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import Address from "@/models/Address";

export async function POST(request) {
  try {
    await connectDB();

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { address } = await request.json();

    console.log("Add address route reached");
    console.log("Authenticated user exists:", Boolean(userId));
    console.log("Address fields:", Object.keys(address ?? {}));
    const newAddress = await Address.create({
      ...address,
      userId,
    });

    return NextResponse.json({
      success: true,
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    console.error("Add address error:", error);

    return NextResponse.json(
      { success: false, message: error.message || "Failed to add address" },
      { status: 500 }
    );
  }
}
