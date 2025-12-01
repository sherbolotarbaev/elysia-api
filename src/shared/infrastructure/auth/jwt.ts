import jwt from 'jsonwebtoken'

import type { User } from 'modules/users/domain/user.schema'
import { env } from '../env'

export interface JWTPayload {
	id: number
	email: string
	iat?: number
	exp?: number
}

export const generateToken = (user: Pick<User, 'id' | 'email'>): string => {
	return jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, {
		expiresIn: env.JWT_EXPIRES_IN as StringValue,
	})
}

export const verifyToken = (token: string): JWTPayload => {
	return jwt.verify(token, env.JWT_SECRET) as JWTPayload
}
