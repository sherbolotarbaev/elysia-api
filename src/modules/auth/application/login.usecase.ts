import { UserRepository } from 'modules/users/infrastructure/user.repository'
import { ErrorMessage, UnauthorizedError } from 'shared/errors'
import { generateToken } from 'shared/infrastructure/auth/jwt'
import { verifyPassword } from 'shared/infrastructure/auth/password'
import { normalizeEmail } from 'shared/utils/sanitize'
import type { LoginRequest } from '../domain/auth.schema'

export const loginUseCase = async (
	loginData: LoginRequest
): Promise<{ user: any; token: string }> => {
	const email = normalizeEmail(loginData.email)

	const user = await UserRepository.getByEmail(email)
	if (!user || !user.password) {
		throw new UnauthorizedError(ErrorMessage.INVALID_CREDENTIALS)
	}

	const isPasswordValid = await verifyPassword(
		loginData.password,
		user.password
	)

	if (!isPasswordValid) {
		throw new UnauthorizedError(ErrorMessage.INVALID_CREDENTIALS)
	}

	const {
		id,
		uuid,
		firstName,
		lastName,
		photo,
		authProvider,
		createdAt,
		updatedAt,
	} = user
	const token = generateToken({
		id,
		email: user.email,
	})

	return {
		user: {
			id,
			uuid,
			email: user.email,
			firstName,
			lastName,
			photo,
			authProvider,
			createdAt,
			updatedAt,
		},
		token,
	}
}
