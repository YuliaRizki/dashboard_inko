import { auth } from "@/lib/auth"; // Your auth.ts file
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);