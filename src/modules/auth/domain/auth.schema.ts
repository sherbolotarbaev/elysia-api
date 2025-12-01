import { z } from 'zod'

import { UserResponseSchema } from 'modules/users/domain/user.schema'

export const LoginRequestSchema = z.object({
	email: z.string().email('Invalid email format').toLowerCase().trim(),
	password: z.string().min(1, 'Password is required').max(128),
})

export const RegisterRequestSchema = z.object({
	firstName: z
		.string()
		.min(1, 'First name is required')
		.max(100, 'First name is too long')
		.trim(),
	lastName: z.string().max(100, 'Last name is too long').trim().optional(),
	email: z
		.string()
		.email('Invalid email format')
		.max(255, 'Email is too long')
		.toLowerCase()
		.trim(),
	password: z
		.string()
		.min(6, 'Password must be at least 6 characters')
		.max(128, 'Password is too long')
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
			'Password must contain uppercase, lowercase, number, and special character'
		),
})

export const AuthResponseSchema = z.object({
	user: UserResponseSchema,
})

export const LoginResponseSchema = AuthResponseSchema
export const RegisterResponseSchema = AuthResponseSchema

export const SuccessAuthResponseSchema = z.object({
	status: z.literal('success'),
	data: AuthResponseSchema,
})

export const ErrorResponseSchema = z.object({
	status: z.literal('error'),
	message: z.string(),
})

export const LogoutResponseSchema = z.object({
	status: z.literal('success'),
	message: z.string(),
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
export type LoginResponse = z.infer<typeof LoginResponseSchema>
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>
export type SuccessAuthResponse = z.infer<typeof SuccessAuthResponseSchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>
