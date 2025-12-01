import { UserRepository } from 'modules/users/infrastructure/user.repository'
import { ErrorMessage, NotFoundError } from 'shared/errors'
import { normalizeEmail } from 'shared/utils/sanitize'

export const deleteUserUseCase = async (email: string): Promise<void> => {
	const normalizedEmail = normalizeEmail(email)
	const user = await UserRepository.getByEmail(normalizedEmail)

	if (!user) {
		throw new NotFoundError(ErrorMessage.USER_NOT_FOUND)
	}

	await UserRepository.deleteByEmail(normalizedEmail)
}
