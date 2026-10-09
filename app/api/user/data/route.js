import { auth, clerkClient } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import { NextResponse } from "next/server";
import User from "@/models/User";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();

    // Check whether the MongoDB user already exists
    let user = await User.findById(userId);

    if (!user) {
      console.log("MongoDB user missing; syncing from Clerk:", userId);

      // Fetch the authenticated user's profile from Clerk
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);

      const email =
        clerkUser.emailAddresses.find(
          (item) => item.id === clerkUser.primaryEmailAddressId
        )?.emailAddress ||
        clerkUser.emailAddresses[0]?.emailAddress;

      if (!email) {
        return NextResponse.json(
          { success: false, message: "No email found for Clerk user" },
          { status: 400 }
        );
      }

      const userData = {
        _id: clerkUser.id,
        name:
          clerkUser.fullName ||
          clerkUser.username ||
          "User",
        email,
        imageUrl: clerkUser.imageUrl || "",
      };

      // Create the document if missing; update it if it already exists
      user = await User.findByIdAndUpdate(
        userId,
        { $setOnInsert: userData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log("MongoDB user synchronized:", user._id);
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GET /api/user/data failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user data",
      },
      { status: 500 }
    );
  }
}