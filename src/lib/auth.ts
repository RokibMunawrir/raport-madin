import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as authSchema from "../db/auth-schema";

export const auth = betterAuth({
    baseUrl: process.env.BETTER_AUTH_BASE_URL,
    trustedOrigins: [process.env.BETTER_AUTH_BASE_URL!],
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: authSchema,
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "Guru",
            },
            teacherId: {
                type: "string",
                required: false,
            },
        },
    },
})