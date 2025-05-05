import type { Config } from 'drizzle-kit';
import { env } from './src/infra/env'; // ❗ use caminho relativo, sem @ para CLI funcionar

export default {
    dbCredentials: {
        url: env.DATABASE_URL,
    },
    dialect: 'postgresql',
    schema: './src/infra/db/schemas/*',
    out: 'src/infra/db/migrations',
} satisfies Config;