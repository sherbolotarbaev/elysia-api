import type { AuthProvider } from 'modules/auth/domain/auth-provider.enum'

interface ISessionUser {
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
