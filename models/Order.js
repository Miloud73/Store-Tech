import mongoose from "mongoose";


const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: "User",
    },
    items: [
        {
            productId: {
                type: String,
                required: true,
                ref: "Product",
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            amount: {
                type: Number,
                required: true,
            },
            address: {
                type: String,
                required: true,
            },
            status: {
                type: String,
                required: true,
                default: "Order placed",
            },
            date: {
                type: Date,
                default: Date.now,
            },
        },
    ],
});

export default mongoose.model("order", orderSchema);