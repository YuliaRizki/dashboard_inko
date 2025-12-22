import { betterAuth } from 'better-auth'
import { pool } from './db'

export const auth = betterAuth({
  database: pool,
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://inkowapi-web.vercel.app',
  ],
  secret: process.env.BETTER_AUTH_SECRET,
  user: {
    modelName: 'users',
  },
  session: {
    modelName: 'sessions',
  },
  account: {
    modelName: 'accounts',
  },
  verification: {
    modelName: 'verifications',
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 6,
  },
})
