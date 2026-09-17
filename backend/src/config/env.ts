import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development','test','production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  FRONTEND_ORIGIN: z.string().url(),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string(),
  AUTH_JWT_SECRET: z.string().min(32),
  AUTH_COOKIE_NAME: z.string().min(1).default('madin_session'),
  AUTH_TOKEN_MINUTES: z.coerce.number().int().positive().max(1440).default(480),
});

export const env = schema.parse(process.env);
export const isProduction = env.NODE_ENV === 'production';
