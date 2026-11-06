import { auth } from "@clerk/nextjs/server";
// import connectDB from "@/config/db";
import Product from "@/models/Product";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { inngest } from "@/config/inngest";

export async function POST(request) {
  try {
    const { userId } = auth(request);
    const { address, items } = await request.json();

    if (!address || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid order data" },
        { status: 400 },
      );
    }

    const amount = await items.reduce((total, item) => {
      const product = Product.findById(item.product);
      return total + product.offerPrice * item.quantity;
    }, 0);

    await inngest.send({
      name: "order/created",
      data: {
        userId,
        items,
        amount: amount + Math.floor(amount * 0.02), // Add tax to amount
        date: Date.now(),
        address,
      },
    });

    const user = await User.find(userId);
    user.cardItems = {};

    await user.save();

    return NextResponse.json(
      { success: true, message: "Order created successfully" }
    );
  } catch (error) {
    console.log("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" }
    );
  }
}
