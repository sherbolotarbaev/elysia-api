import { Elysia } from 'elysia'
import type { ElysiaCookie } from 'elysia/cookies'

import { COOKIE_CONFIG } from 'lib/constants'
import { AuthService } from '../application/auth.service'
import {
	ErrorResponseSchema,
	LoginRequestSchema,
	LogoutResponseSchema,
	RegisterRequestSchema,
	SuccessAuthResponseSchema,
} from '../domain/auth.schema'

export const AuthController = new Elysia({ prefix: '/auth' })
	.onError(({ code, error, set }) => {
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown error'

		if (
			code === 'VALIDATION' ||
			errorMessage.includes('already exists') ||
			errorMessage.includes('Invalid')
		) {
			set.status = 400
			return {
				status: 'error',
				message: errorMessage || 'Bad request',
			}
		}

		if (errorMessage.includes('credentials')) {
			set.status = 401
			return {
				status: 'error',
				message: errorMessage || 'Authentication failed',
			}
		}

		set.status = 500
		return {
			status: 'error',
			message: 'Internal server error',
		}
	})
	.post(
		'/register',
		async ({ body, cookie: { session }, set }) => {
			const validatedBody = RegisterRequestSchema.parse(body)
			const { user, token } = await AuthService.register(validatedBody)

			session.set({
				value: token,
				...(COOKIE_CONFIG as ElysiaCookie),
			})

			set.status = 201
			return {
				status: 'success',
				data: { user },
			}
		},
		{
			body: RegisterRequestSchema,
			response: {
				201: SuccessAuthResponseSchema,
				400: ErrorResponseSchema,
			},
			detail: {
				tags: ['Auth'],
				summary: 'Register a new user',
				description: 'Create a new user account and set session cookie',
			},
		}
	)
	.post(
		'/login',
		async ({ body, cookie: { session } }) => {
			const validatedBody = LoginRequestSchema.parse(body)
			const { user, token } = await AuthService.login(validatedBody)

			session.set({
				value: token,
				...(COOKIE_CONFIG as ElysiaCookie),
			})

			return {
				status: 'success',
				data: { user },
			}
		},
		{
			body: LoginRequestSchema,
			response: {
				200: SuccessAuthResponseSchema,
				401: ErrorResponseSchema,
			},
			detail: {
				tags: ['Auth'],
				summary: 'User login',
				description: 'Authenticate a user and set session cookie',
			},
		}
	)
	.post(
		'/logout',
		async ({ cookie: { session } }) => {
			session.remove()
			return {
				status: 'success',
				message: 'Logged out successfully',
			}
		},
		{
			response: {
				200: LogoutResponseSchema,
			},
			detail: {
				tags: ['Auth'],
				summary: 'User logout',
				description: 'Clear authentication cookie',
			},
		}
	)
