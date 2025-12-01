import { Elysia } from 'elysia'

import { AuthController } from './modules/auth/infrastructure/auth.controller'
import { UserController } from './modules/users/infrastructure/user.controller'

const routes = new Elysia()
	.get('/', () => ({
		message: 'API is running',
		version: '1.0.0',
		docs: '/swagger',
	}))
	.use(AuthController)
	.use(UserController)

export { routes as AppRoutes }
