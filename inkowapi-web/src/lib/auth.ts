import { betterAuth } from "better-auth";
import { pool } from "./db";

export const auth = betterAuth({
  database: pool,
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
  ],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 6,
  },
});
