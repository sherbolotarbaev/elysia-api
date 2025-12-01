import { sql } from 'shared/infrastructure/db'

import { AuthProvider } from 'modules/auth/domain/auth-provider.enum'
import type { User } from '../domain/user.schema'

export interface UserRecord {
	id: number
	uuid: string
	firstName: string
	lastName?: string
	email: string
	phone?: string | null
	photo?: string | null
	password?: string
	authProvider: AuthProvider
	createdAt: Date
	updatedAt: Date
}

export interface CreateUserParams
	extends Omit<User, 'id' | 'uuid' | 'createdAt' | 'updatedAt'> {
	password: string
	lastName: string
}

export class UserRepository {
	static async create(user: CreateUserParams): Promise<UserRecord> {
		const [newUser] = await sql<UserRecord[]>`
      INSERT INTO users ("firstName", "lastName", "email", "password", "authProvider")
      VALUES (${user.firstName}, ${user.lastName}, ${user.email}, ${user.password}, ${user.authProvider})
      RETURNING id, uuid, "firstName", "lastName", "email", "phone", "photo", "password", "authProvider", "createdAt", "updatedAt"
    `
		return newUser
	}

	static async getById(id: number): Promise<UserRecord | undefined> {
		const [user] = await sql<UserRecord[]>`
      SELECT id, uuid, "firstName", "lastName", "email", "phone", "photo", "password", "authProvider", "createdAt", "updatedAt"
      FROM users
      WHERE id = ${id}
    `
		return user
	}

	static async getByEmail(email: string): Promise<UserRecord | undefined> {
		const [user] = await sql<UserRecord[]>`
      SELECT id, uuid, "firstName", "lastName", "email", "phone", "photo", "password", "authProvider", "createdAt", "updatedAt"
      FROM users
      WHERE "email" = ${email}
    `
		return user
	}

	static async getAll(): Promise<UserRecord[]> {
		const users = await sql<UserRecord[]>`
      SELECT id, uuid, "firstName", "lastName", "email", "phone", "photo", "password", "authProvider", "createdAt", "updatedAt"
      FROM users
      ORDER BY "createdAt" DESC
    `
		return users
	}

	static async getPaginated(
		limit: number,
		offset: number
	): Promise<UserRecord[]> {
		const users = await sql<UserRecord[]>`
      SELECT id, uuid, "firstName", "lastName", "email", "phone", "photo", "password", "authProvider", "createdAt", "updatedAt"
      FROM users
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `
		return users
	}

	static async count(): Promise<number> {
		const [result] = await sql<{ count: string }[]>`
      SELECT COUNT(*) as count FROM users
    `
		return parseInt(result.count)
	}

	static async update(
		email: string,
		updates: Partial<
			Pick<UserRecord, 'firstName' | 'lastName' | 'phone' | 'photo'>
		>
	): Promise<UserRecord | undefined> {
		if (Object.keys(updates).length === 0) {
			return await this.getByEmail(email)
		}

		const setObject: Partial<UserRecord> = {}

		if (updates.firstName !== undefined) {
			setObject.firstName = updates.firstName
		}
		if (updates.lastName !== undefined) {
			setObject.lastName = updates.lastName
		}
		if (updates.phone !== undefined) {
			setObject.phone = updates.phone
		}
		if (updates.photo !== undefined) {
			setObject.photo = updates.photo
		}

		const [updatedUser] = await sql<UserRecord[]>`
      UPDATE users
      SET ${sql(setObject)}
      WHERE "email" = ${email}
      RETURNING id, uuid, "firstName", "lastName", "email", "phone", "photo", "password", "authProvider", "createdAt", "updatedAt"
    `
		return updatedUser
	}

	static async deleteByEmail(email: string): Promise<User | undefined> {
		const [deletedUser] = await sql<User[]>`
      DELETE FROM users
      WHERE "email" = ${email}
      RETURNING id, uuid, "firstName", "lastName", "email", "phone", "photo", "password", "authProvider", "createdAt", "updatedAt"
    `
		return deletedUser
	}
}
