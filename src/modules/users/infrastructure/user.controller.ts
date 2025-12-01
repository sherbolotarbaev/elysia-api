import { Elysia } from 'elysia'

import { auth } from 'shared/middleware/auth.middleware'
import { UserService } from '../application/user.service'
import {
	DeleteUserParamsSchema,
	ErrorUserResponseSchema,
	GetUserParamsSchema,
	GetUsersQuerySchema,
	GetUsersResponseSchema,
	SuccessResponseWithDataSchema,
	SuccessUserResponseSchema,
	UpdateUserBodySchema,
	UpdateUserResponseSchema,
	UserResponseSchema,
} from '../domain/user.schema'

export const UserController = new Elysia({ prefix: '/users' })
	.use(auth)
	.guard({ auth: true }, app =>
		app
			.get(
				'/me',
				async ({ user }) => ({
					status: 'success',
					data: user,
				}),
				{
					response: {
						200: SuccessResponseWithDataSchema(UserResponseSchema),
					},
					detail: {
						tags: ['Users'],
						summary: 'Get current authenticated user',
						description: 'Returns the currently authenticated user information',
					},
				}
			)
			.get(
				'/',
				async ({ query }) => {
					const validatedQuery = GetUsersQuerySchema.parse(query)
					const result = await UserService.getAll(validatedQuery)
					return {
						status: 'success',
						data: result,
					}
				},
				{
					query: GetUsersQuerySchema,
					response: {
						200: SuccessResponseWithDataSchema(GetUsersResponseSchema),
						500: ErrorUserResponseSchema,
					},
					detail: {
						tags: ['Users'],
						summary: 'Get users with pagination',
						description:
							'Retrieve a paginated list of users. Default limit is 20, max is 100. Use offset for infinite scroll.',
					},
				}
			)
			.get(
				'/:email',
				async ({ params }) => {
					const validatedParams = GetUserParamsSchema.parse(params)
					const user = await UserService.getByEmail(validatedParams.email)
					if (!user) {
						throw new Error('User not found')
					}
					return {
						status: 'success',
						data: user,
					}
				},
				{
					params: GetUserParamsSchema,
					response: {
						200: SuccessResponseWithDataSchema(UserResponseSchema),
						404: ErrorUserResponseSchema,
					},
					detail: {
						tags: ['Users'],
						summary: 'Get user by email',
						description: 'Retrieve a single user by their email',
					},
				}
			)
			.patch(
				'/:email',
				async ({ params, body }) => {
					const validatedParams = GetUserParamsSchema.parse(params)
					const validatedBody = UpdateUserBodySchema.parse(body)
					const updatedUser = await UserService.update(
						validatedParams.email,
						validatedBody
					)
					return {
						status: 'success',
						data: updatedUser,
					}
				},
				{
					params: GetUserParamsSchema,
					body: UpdateUserBodySchema,
					response: {
						200: SuccessResponseWithDataSchema(UpdateUserResponseSchema),
						400: ErrorUserResponseSchema,
					},
					detail: {
						tags: ['Users'],
						summary: 'Update user',
						description: 'Update user information',
					},
				}
			)
			.delete(
				'/:email',
				async ({ params }) => {
					const validatedParams = DeleteUserParamsSchema.parse(params)
					await UserService.delete(validatedParams.email)
					return {
						status: 'success',
						message: 'User deleted',
					}
				},
				{
					params: DeleteUserParamsSchema,
					response: {
						200: SuccessUserResponseSchema,
						404: ErrorUserResponseSchema,
					},
					detail: {
						tags: ['Users'],
						summary: 'Delete user',
						description: 'Delete a user by their email',
					},
				}
			)
	)
