import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().default(3333),
    DATABASE_URL: z.string().url().startsWith("postgres://"),
    ClOUDFARE_ACCOUNT_ID: z.string(),
    CLOUDFLARE_ACCESS_KEY_ID: z.string(),
    CLOUDFLARE_SECRET_ACCESS_KEY: z.string(),
    CLOUDFLARE_BUCKET_NAME: z.string(),
    CLOUDFLARE_PUBLIC_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
