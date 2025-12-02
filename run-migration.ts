import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { sql } from './src/shared/infrastructure/db'

async function createMigrationsTable() {
	await sql`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
}

async function getExecutedMigrations(): Promise<string[]> {
	const result = await sql<{ name: string }[]>`
    SELECT name FROM migrations ORDER BY executed_at ASC
  `
	return result.map(row => row.name)
}

async function recordMigration(name: string) {
	await sql`
    INSERT INTO migrations (name) VALUES (${name})
  `
}

async function runMigration(filename: string) {
	const migrationPath = join(import.meta.dir, filename)
	const migrationSQL = readFileSync(migrationPath, 'utf-8')

	await sql.begin(async sql => {
		await sql.unsafe(migrationSQL)
		await recordMigration(filename)
	})

	console.log(`✓ ${filename}`)
}

async function migrate() {
	try {
		console.log('Starting database migrations...\n')

		await createMigrationsTable()

		const executedMigrations = await getExecutedMigrations()

		const migrationFiles = readdirSync(import.meta.dir)
			.filter(file => file.endsWith('.sql') && !file.endsWith('.down.sql'))
			.sort()

		const pendingMigrations = migrationFiles.filter(
			file => !executedMigrations.includes(file)
		)

		if (pendingMigrations.length === 0) {
			console.log('✓ No pending migrations')
			process.exit(0)
		}

		console.log(`Found ${pendingMigrations.length} pending migration(s):\n`)

		for (const migration of pendingMigrations) {
			await runMigration(migration)
		}

		console.log('\n✓ All migrations completed successfully')
		process.exit(0)
	} catch (error) {
		console.error('\n✗ Migration failed:', error)
		process.exit(1)
	}
}

migrate()
