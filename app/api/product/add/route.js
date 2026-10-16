import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import authSeller from "../../../../lib/authSeller";
import Product from "../../../../models/Product";
import connectTDB from "../../../../config/db";

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const { userId } = await auth();

    // Check authentication first
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    // Check seller authorization
    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access. Only sellers can add products.",
        },
        { status: 403 }
      );
    }
    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const price = parseFloat(formData.get("price"));
    const offerPrice = parseFloat(formData.get("offerPrice"));
    const category = formData.get("category");
    const files = formData.getAll("images");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "No images provided." },
        { status: 400 }
      );
    }

    const result = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: "auto" },
                        (error, result) => {
                            if (error) {
                                reject(error);
                                return;
                            }
                            resolve(result);
                        }
                    );
                    stream.end(buffer);
                });
      })
    );

    const image = result.map((res) => res.secure_url);
    await connectTDB();
    const newProduct=await Product.create({
      userId,
      name,
      description,
      price,
      offerPrice,
      category,
      images: image,
      date: new Date(),

    });

    return NextResponse.json({ success: true, product: 'upload successful' , newProduct });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "An error occurred while adding the product." },
      { status: 500 }
    );
  }
} 