export enum AuthProvider {
	EMAIL = 'email',
	GOOGLE = 'google',
	APPLE = 'apple',
	GITHUB = 'github',
}

export const AUTH_PROVIDERS = [
	AuthProvider.EMAIL,
	AuthProvider.GOOGLE,
	AuthProvider.APPLE,
	AuthProvider.GITHUB,
] as const
