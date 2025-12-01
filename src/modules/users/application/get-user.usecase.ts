import { NotFoundError } from 'shared/errors/custom-errors'
import { ErrorMessage } from 'shared/errors/error-messages'
import { normalizeEmail } from 'shared/utils/sanitize'
import { UserResponseSchema, type UserResponse } from '../domain/user.schema'
import { UserRepository } from '../infrastructure/user.repository'

export const GetUserResponseSchema = UserResponseSchema

export type GetUserResponse = UserResponse

export const getUserByEmailUseCase = async (
	email: string
): Promise<GetUserResponse> => {
	const normalizedEmail = normalizeEmail(email)
	const user = await UserRepository.getByEmail(normalizedEmail)

	if (!user) {
		throw new NotFoundError(ErrorMessage.USER_NOT_FOUND)
	}

	const { password, ...userWithoutPassword } = user

	return userWithoutPassword
}
