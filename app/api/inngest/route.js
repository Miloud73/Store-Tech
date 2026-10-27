// src/app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest, syncUserDeletion, syncUserUpdation, synUserCreation, createUserOrder } from "../../../config/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncUserDeletion,
    syncUserUpdation,
    synUserCreation,
    createUserOrder
  ],
});