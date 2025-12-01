import { z } from 'zod'

import { AuthProvider } from 'modules/auth/domain/auth-provider.enum'

export const UserSchema = z.object({
	id: z.number(),
	uuid: z.string().uuid(),
	firstName: z.string(),
	lastName: z.string().optional(),
	email: z.string().email(),
	phone: z.string().nullable().optional(),
	photo: z.string().url().nullable().optional(),
	password: z
		.string()
		.min(6)
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
		)
		.optional(),
	authProvider: z.nativeEnum(AuthProvider),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export const UserPublicSchema = UserSchema.omit({ password: true })

export const UserResponseSchema = z.object({
	id: z.number(),
	uuid: z.string().uuid(),
	firstName: z.string(),
	lastName: z.string().optional(),
	email: z.string().email(),
	phone: z.string().nullable().optional(),
	photo: z.string().url().nullable().optional(),
	authProvider: z.nativeEnum(AuthProvider),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export const GetUsersQuerySchema = z.object({
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
})

export const GetUsersResponseSchema = z.object({
	users: z.array(UserResponseSchema),
	pagination: z.object({
		limit: z.number(),
		offset: z.number(),
		total: z.number(),
		hasMore: z.boolean(),
	}),
})

export const GetUserParamsSchema = z.object({
	email: z.string().email(),
})

export const UpdateUserBodySchema = z.object({
	firstName: z.string().min(1).optional(),
	lastName: z.string().min(1).optional(),
	photo: z.string().nullable().optional(),
})

export const UpdateUserResponseSchema = UserResponseSchema

export const DeleteUserParamsSchema = z.object({
	email: z.string().email(),
})

export const SuccessResponseWithDataSchema = <T extends z.ZodTypeAny>(
	dataSchema: T
) =>
	z.object({
		status: z.literal('success'),
		data: dataSchema,
	})

export const SuccessUserResponseSchema = z.object({
	status: z.literal('success'),
	message: z.string(),
})

export const ErrorUserResponseSchema = z.object({
	status: z.literal('error'),
	message: z.string(),
})

export type User = z.infer<typeof UserSchema>
export type UserPublic = z.infer<typeof UserPublicSchema>
export type UserResponse = z.infer<typeof UserResponseSchema>
export type GetUsersQuery = z.infer<typeof GetUsersQuerySchema>
export type GetUsersResponse = z.infer<typeof GetUsersResponseSchema>
export type GetUserParams = z.infer<typeof GetUserParamsSchema>
export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>
export type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>
export type DeleteUserParams = z.infer<typeof DeleteUserParamsSchema>
export type SuccessUserResponse = z.infer<typeof SuccessUserResponseSchema>
export type ErrorUserResponse = z.infer<typeof ErrorUserResponseSchema>
