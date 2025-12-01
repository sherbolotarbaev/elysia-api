import { z } from 'zod'

import { sanitizePhone, sanitizeString } from 'shared/utils/sanitize'
import { UserResponseSchema, type UserResponse } from '../domain/user.schema'
import { UserRepository } from '../infrastructure/user.repository'

export const UpdateUserRequestSchema = z.object({
	firstName: z
		.string()
		.min(1, 'First name cannot be empty')
		.max(100, 'First name is too long')
		.trim()
		.optional(),
	lastName: z.string().max(100, 'Last name is too long').trim().optional(),
	phone: z
		.string()
		.max(20, 'Phone number is too long')
		.regex(/^[\d+\-() ]*$/, 'Invalid phone number format')
		.nullable()
		.optional(),
	photo: z
		.string()
		.url('Invalid photo URL')
		.max(500, 'Photo URL is too long')
		.nullable()
		.optional(),
})

export const UpdateUserResponseSchema = UserResponseSchema

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>
export type UpdateUserResponse = UserResponse

export const updateUserUseCase = async (
	email: string,
	updates: UpdateUserRequest
): Promise<UpdateUserResponse> => {
	const user = await UserRepository.getByEmail(email)

	if (!user) {
		throw new Error('User not found')
	}

	const sanitizedUpdates: {
		firstName?: string
		lastName?: string
		phone?: string | null
		photo?: string | null
	} = {}

	if (updates.firstName !== undefined) {
		sanitizedUpdates.firstName = sanitizeString(updates.firstName)
	}
	if (updates.lastName !== undefined) {
		sanitizedUpdates.lastName = sanitizeString(updates.lastName)
	}
	if (updates.phone !== undefined) {
		sanitizedUpdates.phone = updates.phone ? sanitizePhone(updates.phone) : null
	}
	if (updates.photo !== undefined) {
		sanitizedUpdates.photo = updates.photo
	}

	const updatedUser = await UserRepository.update(email, sanitizedUpdates)

	if (!updatedUser) {
		throw new Error('Failed to update user')
	}

	const { password, ...userWithoutPassword } = updatedUser

	return userWithoutPassword
}
