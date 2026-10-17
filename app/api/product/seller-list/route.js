import { auth } from "@clerk/nextjs/server";
import authSeller from "@/lib/authSeller";
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import connectDB from "@/config/db";



export async function GET(request){
    try {
        const { userId } = auth();

        const isSeller = authSeller(userId);

        if(!isSeller){
            return NextResponse.json({success:false,message: "Unauthorized"}, {status: 401})
        }

        await connectDB()

        const products = await Product.find({
            sellerId: userId
        })

        return NextResponse.json({success:true,products}, {status: 200})
    } catch (error) {

        return NextResponse.json({success:false,message: error.message}, {status: 500})
        
    }

}