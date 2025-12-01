import { Elysia } from 'elysia'
import type { ElysiaCookie } from 'elysia/cookies'

import { COOKIE_CONFIG } from 'lib/constants'
import { AuthService } from '../application/auth.service'
import { OtpService } from '../application/otp.service'
import { verifyOtpUseCase } from '../application/verify-otp.usecase'
import {
	ErrorResponseSchema,
	LoginRequestSchema,
	LogoutResponseSchema,
	OtpResponseSchema,
	RegisterRequestSchema,
	SendOtpRequestSchema,
	SuccessAuthResponseSchema,
	VerifyOtpRequestSchema,
	VerifyOtpSuccessResponseSchema,
} from '../domain/auth.schema'

export const AuthController = new Elysia({ prefix: '/auth' })
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
		'/send-otp',
		async ({ body }) => {
			const validatedBody = SendOtpRequestSchema.parse(body)
			await OtpService.sendOtp(
				validatedBody.email,
				validatedBody.firstName,
				validatedBody.lastName
			)

			return {
				status: 'success',
				message: 'OTP sent to your email',
			}
		},
		{
			body: SendOtpRequestSchema,
			response: {
				200: OtpResponseSchema,
				400: ErrorResponseSchema,
			},
			detail: {
				tags: ['Auth'],
				summary: 'Send OTP',
				description:
					'Send OTP for registration (with firstName/lastName) or login (email only)',
			},
		}
	)
	.post(
		'/verify-otp',
		async ({ body, cookie: { session }, set }) => {
			const validatedBody = VerifyOtpRequestSchema.parse(body)
			const otpData = OtpService.verifyOtp(
				validatedBody.email,
				validatedBody.code
			)

			const { user, token } = await verifyOtpUseCase(
				validatedBody.email,
				otpData.isRegistration,
				otpData.firstName,
				otpData.lastName
			)

			session.set({
				value: token,
				...(COOKIE_CONFIG as ElysiaCookie),
			})

			if (otpData.isRegistration) {
				set.status = 201
			}

			return {
				status: 'success',
				data: { user },
			}
		},
		{
			body: VerifyOtpRequestSchema,
			response: {
				200: VerifyOtpSuccessResponseSchema,
				201: VerifyOtpSuccessResponseSchema,
				400: ErrorResponseSchema,
			},
			detail: {
				tags: ['Auth'],
				summary: 'Verify OTP',
				description:
					'Verify OTP and create user if registration, or login if existing user',
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
