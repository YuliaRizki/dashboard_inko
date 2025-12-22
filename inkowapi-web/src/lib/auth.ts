import { betterAuth } from 'better-auth'
import { pool } from './db'

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL || 'https://inkowapi-web.vercel.app',
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://inkowapi-web.vercel.app',
  ],
  secret: process.env.BETTER_AUTH_SECRET,
  user: {
    modelName: 'users',
    additionalFields: {
      nik: { type: 'string', required: false },
      fullName: { type: 'string', required: false },
      pob: { type: 'string', required: false },
      dob: { type: 'string', required: false },
      taxId: { type: 'string', required: false },
      religion: { type: 'string', required: false },
      nationality: { type: 'string', required: false },
      maritalStatus: { type: 'string', required: false },
      occupation: { type: 'string', required: false },
      address: { type: 'string', required: false },
    },
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
