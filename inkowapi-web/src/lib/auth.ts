import { betterAuth } from "better-auth";
import { pool } from "./db";

export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, 
    minPasswordLength: 6,
  },
});
