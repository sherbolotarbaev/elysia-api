import { cookie } from '@elysiajs/cookie'
import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'

import { AppRoutes } from './app.routes'
import { swaggerConfig } from './swagger'

import { env } from './shared/infrastructure/env'

const app = new Elysia()
	.use(
		cors({
			origin: true,
			credentials: true,
		})
	)
	.use(
		cookie({
			secret: env.JWT_SECRET,
		})
	)
	.use(swaggerConfig)
	.use(AppRoutes)

app.listen(env.PORT)

console.log(`App is running at ${app.server?.hostname}:${app.server?.port}`)
