"use server";
import { pool } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getProfileProtocol() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return null;

    try {
        const result = await pool.query(
            'SELECT * FROM "user" WHERE id = $1',
            [session.user.id]
        );
        
        return result.rows[0];
    } catch (error) {
        console.error("Fetch Protocol Error:", error);
        return null;
    }
}