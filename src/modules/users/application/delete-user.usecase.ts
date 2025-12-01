import { UserRepository } from 'modules/users/infrastructure/user.repository'
import { normalizeEmail } from 'shared/utils/sanitize'

export const deleteUserUseCase = async (email: string): Promise<void> => {
	const normalizedEmail = normalizeEmail(email)
	const user = await UserRepository.getByEmail(normalizedEmail)

	if (!user) {
		throw new Error('User not found')
	}

	await UserRepository.deleteByEmail(normalizedEmail)
}
