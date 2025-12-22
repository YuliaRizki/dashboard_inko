import { pool } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const queries = [
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "nik" TEXT;`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "fullName" TEXT;`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pob" TEXT;`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "dob" TEXT;`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "taxId" TEXT;`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "religion" TEXT;`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "nationality" TEXT;`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "maritalStatus" TEXT;`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "occupation" TEXT;`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address" TEXT;`,
    ]

    for (const q of queries) {
      await pool.query(q)
    }

    return NextResponse.json({
      success: true,
      message: "Migration successful: Columns added to 'users' table.",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: `Migration Failed: ${error.message}`,
      },
      { status: 500 },
    )
  }
}
