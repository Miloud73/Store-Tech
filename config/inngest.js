import { Inngest } from "inngest";
import connectDB from "./db";
import User from "../models/User";
import Order from "../models/Order";

export const inngest = new Inngest({
  id: "store_tech-next",
});

export const synUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    triggers: {
      event: "clerk/user.created",
    },
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      imageUrl: image_url,
    };

    await connectDB();
    await User.create(userData);
  },
);

export const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    triggers: {
      event: "clerk/user.updated",
    },
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      imageUrl: image_url,
    };

    await connectDB();
    await User.findByIdAndUpdate(id, userData);
  },
);

export const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
    triggers: {
      event: "clerk/user.deleted",
    },
  },
  async ({ event }) => {
    const { id } = event.data;

    await connectDB();
    await User.findByIdAndDelete(id);
  },
);

export const createUserOrder = inngest.createFunction(
  {
    id: "create-user-order",
    triggers: [{ event: "order/created" }],
    batchEvents: {
      maxSize: 5,
      timeout: "5s",
    },
  },
  async ({ events }) => {
    const orders = events.map((event) => ({
      userId: event.data.userId,
      items: event.data.items,
      amount: event.data.amount,
      address: event.data.address,
      date: event.data.date,
    }));

    await connectDB();
    await Order.insertMany(orders);

    return {
      success: true,
      processed: orders.length,
    };
  },
);
