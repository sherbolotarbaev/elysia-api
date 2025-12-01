import { z } from 'zod'

const envSchema = z.object({
	// Application
	NODE_ENV: z
		.enum(['test', 'development', 'production'])
		.default('development'),
	PORT: z.string().default('4000'),

	// Database
	PG_HOST: z.string().default('localhost'),
	PG_PORT: z.string().default('6543'),
	PG_DATABASE: z.string().default('app'),
	PG_USER: z.string().default('app'),
	PG_PASSWORD: z.string(),
	PG_CONNECTION_LIMIT: z.string().default('20'),

	// JWT
	JWT_SECRET: z.string().default('secret'),
	JWT_EXPIRES_IN: z.string().default('1d'),

	// SendGrid
	SENDGRID_API_KEY: z.string(),
	SENDGRID_FROM_EMAIL: z.string().email(),
})

export const env = envSchema.parse(process.env)

export const DATABASE_URL = `postgres://${env.PG_USER}:${env.PG_PASSWORD}@${env.PG_HOST}:${env.PG_PORT}/${env.PG_DATABASE}?pgbouncer=true&connection_limit=${env.PG_CONNECTION_LIMIT}`
