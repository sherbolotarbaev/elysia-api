import type {
	AuthResponse,
	LoginRequest,
	RegisterRequest,
} from '../domain/auth.schema'
import { loginUseCase } from './login.usecase'
import { registerUseCase } from './register.usecase'

export class AuthService {
	static async login(
		data: LoginRequest
	): Promise<AuthResponse & { token: string }> {
		return await loginUseCase(data)
	}

	static async register(
		data: RegisterRequest
	): Promise<AuthResponse & { token: string }> {
		return await registerUseCase(data)
	}
}
