import { z } from 'zod'

import { UserResponseSchema } from '../domain/user.schema'
import { UserRepository } from '../infrastructure/user.repository'

export const GetUsersQuerySchema = z.object({
	limit: z.coerce.number().min(1).max(100).default(20),
	offset: z.coerce.number().min(0).default(0),
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

export type GetUsersQuery = z.infer<typeof GetUsersQuerySchema>
export type GetUsersResponse = z.infer<typeof GetUsersResponseSchema>

export const getUsersUseCase = async (
	query: GetUsersQuery
): Promise<GetUsersResponse> => {
	const { limit, offset } = query

	const [users, total] = await Promise.all([
		UserRepository.getPaginated(limit, offset),
		UserRepository.count(),
	])

	const usersWithoutPassword = users.map(user => {
		const { password, ...userWithoutPassword } = user
		return userWithoutPassword
	})

	return {
		users: usersWithoutPassword,
		pagination: {
			limit,
			offset,
			total,
			hasMore: offset + limit < total,
		},
	}
}
