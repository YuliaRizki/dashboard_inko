'use server'
import { pool } from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function saveIdentityProtocol(data: any) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    console.error('PROTOCOL ERROR: No active session.')
    return { success: false, error: 'Authentication Required' }
  }

  const userId = session.user.id
  console.log('PROTOCOL INITIATED for User ID:', userId)

  try {
    const checkUser = await pool.query(`SELECT id FROM "users" WHERE id = $1`, [userId])
    if (checkUser.rowCount === 0) {
      console.error(`CRITICAL: User ID ${userId} from session NOT FOUND in 'users' table.`)
      return { success: false, error: 'User record missing from database. Please re-login.' }
    }

    const query = `
            UPDATE "users" 
            SET 
                nik = $1, 
                "fullName" = $2, 
                pob = $3, 
                dob = $4, 
                "taxId" = $5, 
                religion = $6, 
                nationality = $7, 
                "maritalStatus" = $8, 
                occupation = $9, 
                address = $10,
                "updatedAt" = NOW()
            WHERE id = $11
            RETURNING id;
        `

    const values = [
      data.idNumber || null,
      data.fullName || null,
      data.birthPlace || null,
      data.birthDate || null,
      data.taxId || null,
      data.religion || null,
      data.nationality || null,
      data.maritalStatus || null,
      data.occupation || null,
      data.address || null,
      userId,
    ]

    const res = await pool.query(query, values)

    if (res.rowCount === 0) {
      console.error(`DATA MISMATCH: No user found with ID ${userId}`)
      return { success: false, error: 'Identity record not found in database.' }
    }

    console.log('SUCCESS: Identity protocol secured for ID:', res.rows[0].id)
    return { success: true }
  } catch (error: any) {
    console.error('POSTGRES ERROR:', error.message)
    return { success: false, error: `Database rejected protocol update: ${error.message}` }
  }
}
