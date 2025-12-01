import { Elysia } from 'elysia'

import { AuthController } from './modules/auth/infrastructure/auth.controller'
import { UserController } from './modules/users/infrastructure/user.controller'
import {
	BadRequestError,
	ConflictError,
	ErrorMessage,
	InternalServerError,
	NotFoundError,
	UnauthorizedError,
} from './shared/errors'

const routes = new Elysia()
	.error({
		UnauthorizedError,
		BadRequestError,
		NotFoundError,
		ConflictError,
		InternalServerError,
	})
	.onError(({ code, error, set }) => {
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown error'

		console.error(`[${code}]`, errorMessage)

		switch (code) {
			case 'UnauthorizedError':
				set.status = 401
				return {
					status: 'error',
					message: errorMessage,
				}

			case 'BadRequestError':
				set.status = 400
				return {
					status: 'error',
					message: errorMessage,
				}

			case 'NotFoundError':
				set.status = 404
				return {
					status: 'error',
					message: errorMessage,
				}

			case 'ConflictError':
				set.status = 409
				return {
					status: 'error',
					message: errorMessage,
				}

			case 'InternalServerError':
				set.status = 500
				return {
					status: 'error',
					message: errorMessage,
				}

			case 'VALIDATION':
				set.status = 400
				return {
					status: 'error',
					message: errorMessage || ErrorMessage.VALIDATION_FAILED,
				}

			case 'NOT_FOUND':
				set.status = 404
				return {
					status: 'error',
					message: ErrorMessage.ROUTE_NOT_FOUND,
				}

			default:
				set.status = 500
				return {
					status: 'error',
					message: ErrorMessage.INTERNAL_SERVER_ERROR,
				}
		}
	})
	.get('/', () => ({
		message: 'API is running',
		version: '1.0.0',
		docs: '/swagger',
	}))
	.use(AuthController)
	.use(UserController)

export { routes as AppRoutes }
