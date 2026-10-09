import { inngest } from "@/config/inngest";

export async function POST(req) {
  try {
    const event = await req.json();

    console.log("Clerk webhook received:", event.type);

    await inngest.send({
      name: `clerk/${event.type}`,
      data: event.data,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Clerk webhook error:", error);

    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
