export const sanitizeString = (input: string): string => {
	return input.trim().replace(/[<>]/g, '').slice(0, 500)
}

export const normalizeEmail = (email: string): string => {
	return email.toLowerCase().trim()
}

export const sanitizePhone = (phone: string): string => {
	return phone.replace(/[^\d+\-() ]/g, '').slice(0, 20)
}
