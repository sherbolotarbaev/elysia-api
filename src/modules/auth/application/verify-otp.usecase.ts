import { AuthProvider } from 'modules/auth/domain/auth-provider.enum'
import { UserRepository } from 'modules/users/infrastructure/user.repository'
import {
	BadRequestError,
	ConflictError,
	ErrorMessage,
	NotFoundError,
} from 'shared/errors'
import { generateToken } from 'shared/infrastructure/auth/jwt'
import { normalizeEmail, sanitizeString } from 'shared/utils/sanitize'

interface VerifyOtpResult {
	user: {
		id: number
		uuid: string
		email: string
		firstName: string
		lastName?: string
		phone?: string | null
		photo?: string | null
		authProvider: AuthProvider
		createdAt: Date
		updatedAt: Date
	}
	token: string
}

export const verifyOtpUseCase = async (
	email: string,
	isRegistration: boolean,
	firstName?: string,
	lastName?: string
): Promise<VerifyOtpResult> => {
	const normalizedEmail = normalizeEmail(email)

	if (isRegistration) {
		if (!firstName) {
			throw new BadRequestError(ErrorMessage.FIRST_NAME_REQUIRED)
		}

		const existingUser = await UserRepository.getByEmail(normalizedEmail)
		if (existingUser) {
			throw new ConflictError(ErrorMessage.EMAIL_ALREADY_EXISTS)
		}

		const sanitizedFirstName = sanitizeString(firstName)
		const sanitizedLastName = lastName ? sanitizeString(lastName) : ''

		const newUser = await UserRepository.create({
			firstName: sanitizedFirstName,
			lastName: sanitizedLastName,
			email: normalizedEmail,
			authProvider: AuthProvider.EMAIL,
			password: '',
		})

		const token = generateToken({
			id: newUser.id,
			email: newUser.email,
		})

		return {
			user: {
				id: newUser.id,
				uuid: newUser.uuid,
				email: newUser.email,
				firstName: newUser.firstName,
				lastName: newUser.lastName,
				phone: newUser.phone,
				photo: newUser.photo,
				authProvider: newUser.authProvider,
				createdAt: newUser.createdAt,
				updatedAt: newUser.updatedAt,
			},
			token,
		}
	} else {
		const existingUser = await UserRepository.getByEmail(normalizedEmail)
		if (!existingUser) {
			throw new NotFoundError(ErrorMessage.USER_NOT_FOUND_REGISTER)
		}

		const token = generateToken({
			id: existingUser.id,
			email: existingUser.email,
		})

		return {
			user: {
				id: existingUser.id,
				uuid: existingUser.uuid,
				email: existingUser.email,
				firstName: existingUser.firstName,
				lastName: existingUser.lastName,
				phone: existingUser.phone,
				photo: existingUser.photo,
				authProvider: existingUser.authProvider,
				createdAt: existingUser.createdAt,
				updatedAt: existingUser.updatedAt,
			},
			token,
		}
	}
}
