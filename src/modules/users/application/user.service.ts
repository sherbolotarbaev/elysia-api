import {
	type GetUsersQuery,
	type GetUsersResponse,
	type UpdateUserBody,
	type UserResponse,
} from '../domain/user.schema'
import { deleteUserUseCase } from './delete-user.usecase'
import { getUserByEmailUseCase } from './get-user.usecase'
import { getUsersUseCase } from './get-users.usecase'
import { updateUserUseCase } from './update-user.usecase'

export class UserService {
	static async getAll(query: GetUsersQuery): Promise<GetUsersResponse> {
		const limit = query.limit ?? 20
		const offset = query.offset ?? 0
		return await getUsersUseCase({ limit, offset })
	}

	static async getByEmail(email: string): Promise<UserResponse | null> {
		return await getUserByEmailUseCase(email)
	}

	static async update(
		email: string,
		data: UpdateUserBody
	): Promise<UserResponse> {
		return await updateUserUseCase(email, data)
	}

	static async delete(email: string): Promise<void> {
		return await deleteUserUseCase(email)
	}
}
