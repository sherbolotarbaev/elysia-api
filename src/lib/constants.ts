import { env } from 'shared/infrastructure/env'

export const COOKIE_CONFIG = {
	httpOnly: true,
	secure: env.NODE_ENV === 'production',
	sameSite: 'lax',
	maxAge: 7 * 24 * 60 * 60, // 7 days
}
