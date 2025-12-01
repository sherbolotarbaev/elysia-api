import sgMail from '@sendgrid/mail'

import { BadRequestError, ErrorMessage } from 'shared/errors'
import { env } from 'shared/infrastructure/env'

if (env.SENDGRID_API_KEY) {
	sgMail.setApiKey(env.SENDGRID_API_KEY)
}

export interface OtpData {
	code: string
	expiresAt: number
	attempts: number
	isRegistration: boolean
	firstName?: string
	lastName?: string
}

export class OtpService {
	private static otpStore = new Map<string, OtpData>()
	private static readonly OTP_EXPIRY_MS = 5 * 60 * 1000
	private static readonly MAX_ATTEMPTS = 3

	private static generateCode(): string {
		return Math.floor(100000 + Math.random() * 900000).toString()
	}

	static async sendOtp(
		email: string,
		firstName?: string,
		lastName?: string
	): Promise<void> {
		const existingOtp = this.otpStore.get(email)

		if (existingOtp && existingOtp.expiresAt > Date.now()) {
			throw new BadRequestError(ErrorMessage.OTP_ALREADY_SENT)
		}

		const code = this.generateCode()
		const expiresAt = Date.now() + this.OTP_EXPIRY_MS
		const isRegistration = !!(firstName && firstName.trim())

		this.otpStore.set(email, {
			code,
			expiresAt,
			attempts: 0,
			isRegistration,
			firstName,
			lastName,
		})

		console.log(`[DEV] OTP Code for ${email}: ${code}`)

		if (env.SENDGRID_API_KEY && env.SENDGRID_FROM_EMAIL) {
			await sgMail.send({
				to: email,
				from: env.SENDGRID_FROM_EMAIL,
				subject: 'Your OTP Code',
				text: `Your OTP code is: ${code}. It will expire in 5 minutes.`,
				html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2>Your OTP Code</h2>
				<p>Use the following code to verify your email:</p>
				<div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
					${code}
				</div>
				<p>This code will expire in 5 minutes.</p>
				<p>If you didn't request this code, please ignore this email.</p>
			</div>
		`,
			})
		}

		setTimeout(() => {
			this.otpStore.delete(email)
		}, this.OTP_EXPIRY_MS)
	}

	static verifyOtp(email: string, code: string): OtpData {
		const otpData = this.otpStore.get(email)

		if (!otpData) {
			throw new BadRequestError(ErrorMessage.OTP_NOT_FOUND)
		}

		if (otpData.expiresAt < Date.now()) {
			this.otpStore.delete(email)
			throw new BadRequestError(ErrorMessage.OTP_EXPIRED)
		}

		if (otpData.attempts >= this.MAX_ATTEMPTS) {
			this.otpStore.delete(email)
			throw new BadRequestError(ErrorMessage.OTP_MAX_ATTEMPTS)
		}

		otpData.attempts++

		if (otpData.code !== code) {
			if (otpData.attempts >= this.MAX_ATTEMPTS) {
				this.otpStore.delete(email)
			}
			throw new BadRequestError(ErrorMessage.INVALID_OTP_CODE)
		}

		this.otpStore.delete(email)
		return otpData
	}

	static clearOtp(email: string): void {
		this.otpStore.delete(email)
	}
}
