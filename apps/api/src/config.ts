import { z } from 'zod';

export const AppConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  DATA_STORE: z.enum(['memory', 'postgres']).default('memory'),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  LLM_PROVIDER: z.string().default('mock'),
  EMBEDDING_PROVIDER: z.string().default('mock'),
  OCR_PROVIDER: z.string().default('mock'),
  MALWARE_SCANNER: z.string().default('mock'),
  STORAGE_PROVIDER: z.string().default('mock'),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

export function loadConfig(): AppConfig {
  return AppConfigSchema.parse(process.env);
}
