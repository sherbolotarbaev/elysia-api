import { AuthProvider } from 'modules/auth/domain/auth-provider.enum'
import { UserRepository } from 'modules/users/infrastructure/user.repository'
import { generateToken } from 'shared/infrastructure/auth/jwt'
import { hashPassword } from 'shared/infrastructure/auth/password'
import { normalizeEmail, sanitizeString } from 'shared/utils/sanitize'
import type { RegisterRequest } from '../domain/auth.schema'

export const registerUseCase = async (
	userData: RegisterRequest
): Promise<{ user: any; token: string }> => {
	const email = normalizeEmail(userData.email)
	const firstName = sanitizeString(userData.firstName)
	const lastName = userData.lastName ? sanitizeString(userData.lastName) : ''

	const existingUser = await UserRepository.getByEmail(email)
	if (existingUser) {
		throw new Error('Email already exists')
	}

	const password = await hashPassword(userData.password)
	const newUser = await UserRepository.create({
		firstName,
		lastName,
		email,
		authProvider: AuthProvider.EMAIL,
		password,
	})

	const {
		id,
		uuid,
		firstName: userFirstName,
		lastName: userLastName,
		photo,
		authProvider,
		createdAt,
		updatedAt,
	} = newUser
	const token = generateToken({
		id,
		email: newUser.email,
	})

	return {
		user: {
			id,
			uuid,
			email: newUser.email,
			firstName: userFirstName,
			lastName: userLastName,
			photo,
			authProvider,
			createdAt,
			updatedAt,
		},
		token,
	}
}
