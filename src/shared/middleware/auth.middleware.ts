import { Elysia } from 'elysia'
import jwt from 'jsonwebtoken'

import { UserRepository } from 'modules/users/infrastructure/user.repository'
import { verifyToken, type JWTPayload } from '../infrastructure/auth/jwt'

export const auth = new Elysia({ name: 'auth' }).macro({
	auth(enabled: boolean) {
		return {
			async resolve({ headers, cookie, status }) {
				if (!enabled) return

				const tokenFromHeader = headers.authorization?.replace('Bearer ', '')
				const tokenFromCookie = cookie?.session?.value
				const token = tokenFromHeader || tokenFromCookie

				if (!token || typeof token !== 'string') {
					return status(401, {
						status: 'error',
						message: 'Unauthorized: No token provided',
					})
				}

				try {
					const payload = verifyToken(token) as JWTPayload

					if (!payload?.id || !payload?.email) {
						return status(401, {
							status: 'error',
							message: 'Unauthorized: Invalid token payload',
						})
					}

					const user = await UserRepository.getById(payload.id)

					if (!user) {
						return status(401, {
							status: 'error',
							message: 'Unauthorized: User not found',
						})
					}

					return {
						user: {
							id: user.id,
							uuid: user.uuid,
							email: user.email,
							firstName: user.firstName,
							lastName: user.lastName,
							phone: user.phone,
							photo: user.photo,
							authProvider: user.authProvider,
							createdAt: user.createdAt,
							updatedAt: user.updatedAt,
						},
					}
				} catch (error) {
					if (error instanceof jwt.JsonWebTokenError) {
						return status(401, {
							status: 'error',
							message: 'Unauthorized: Invalid token',
						})
					}

					if (error instanceof jwt.TokenExpiredError) {
						return status(401, {
							status: 'error',
							message: 'Unauthorized: Token expired',
						})
					}

					return status(401, {
						status: 'error',
						message: 'Unauthorized: Authentication failed',
					})
				}
			},
		}
	},
})
