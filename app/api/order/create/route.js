import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";
import User from "@/models/User";
import { inngest } from "@/config/inngest";

export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { address, items } = await request.json();

    if (!address || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid order data" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check that the user exists BEFORE sending the order.
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found in database. Please sign out and sign in again.",
        },
        { status: 404 }
      );
    }

    // Validate products and calculate the total.
    const orderItems = await Promise.all(
      items.map(async (item) => {
        if (!item.product || !Number.isInteger(item.quantity) || item.quantity < 1) {
          throw new Error("Invalid product or quantity");
        }

        const product = await Product.findById(item.product);

        if (!product) {
          throw new Error(`Product not found: ${item.product}`);
        }

        return {
          productId: product._id,
          quantity: item.quantity,
          price: product.offerPrice,
        };
      })
    );

    const subtotal = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const amount = subtotal + Math.floor(subtotal * 0.02);

    // Send the order to Inngest.
    await inngest.send({
      name: "order/created",
      data: {
        userId,
        items: orderItems.map(({ productId, quantity }) => ({
          productId,
          quantity,
        })),
        amount,
        date: new Date(),
        address,
      },
    });

    // Clear the user's cart after the event has been accepted.
    user.cartItem = {};
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Create order error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create order",
      },
      { status: 500 }
    );
  }
}