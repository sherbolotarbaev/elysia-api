import { sql } from '../src/shared/infrastructure/db'

const BATCH_SIZE = 10
const TOTAL_USERS = 100

const firstNames = [
	'John',
	'Jane',
	'Michael',
	'Sarah',
	'David',
	'Emma',
	'James',
	'Emily',
	'Robert',
	'Olivia',
	'William',
	'Sophia',
	'Daniel',
	'Isabella',
	'Matthew',
	'Ava',
	'Christopher',
	'Mia',
	'Andrew',
	'Charlotte',
]

const lastNames = [
	'Smith',
	'Johnson',
	'Williams',
	'Brown',
	'Jones',
	'Garcia',
	'Miller',
	'Davis',
	'Rodriguez',
	'Martinez',
	'Hernandez',
	'Lopez',
	'Gonzalez',
	'Wilson',
	'Anderson',
	'Thomas',
	'Taylor',
	'Moore',
	'Jackson',
	'Martin',
]

const providers = ['email', 'google', 'apple', 'github'] as const

function generateRandomUser(index: number) {
	const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
	const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
	const email = `user${index}@example.com`
	const phone =
		Math.random() > 0.5
			? `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`
			: null
	const photo =
		Math.random() > 0.6
			? `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`
			: null
	const authProvider = providers[Math.floor(Math.random() * providers.length)]

	return {
		firstName,
		lastName,
		email,
		phone,
		photo,
		authProvider,
		password: '$2b$10$YourHashedPasswordHere',
	}
}

async function seedUsers() {
	try {
		console.log(`Starting to seed ${TOTAL_USERS} users...\n`)

		const startTime = Date.now()
		let totalInserted = 0

		for (let i = 0; i < TOTAL_USERS; i += BATCH_SIZE) {
			const batchStart = Date.now()
			const users = []

			for (let j = 0; j < BATCH_SIZE && i + j < TOTAL_USERS; j++) {
				users.push(generateRandomUser(i + j + 1))
			}

			await sql`
        INSERT INTO users ${sql(
					users,
					'firstName',
					'lastName',
					'email',
					'phone',
					'photo',
					'password',
					'authProvider'
				)}
      `

			totalInserted += users.length
			const batchTime = Date.now() - batchStart
			const progress = ((totalInserted / TOTAL_USERS) * 100).toFixed(1)

			console.log(
				`✓ Inserted batch: ${totalInserted.toLocaleString()}/${TOTAL_USERS.toLocaleString()} (${progress}%) - ${batchTime}ms`
			)
		}

		const totalTime = ((Date.now() - startTime) / 1000).toFixed(2)
		console.log(
			`\n✓ Successfully seeded ${totalInserted.toLocaleString()} users in ${totalTime}s`
		)
		process.exit(0)
	} catch (error) {
		console.error('\n✗ Seed failed:', error)
		process.exit(1)
	}
}

seedUsers()
