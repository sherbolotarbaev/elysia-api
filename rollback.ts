import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { sql } from './src/shared/infrastructure/db'

async function getLastMigration(): Promise<string | null> {
	const result = await sql<{ name: string }[]>`
    SELECT name FROM migrations ORDER BY executed_at DESC LIMIT 1
  `
	return result[0]?.name || null
}

async function removeMigrationRecord(name: string) {
	await sql`
    DELETE FROM migrations WHERE name = ${name}
  `
}

async function rollback() {
	try {
		console.log('Rolling back last migration...\n')

		const lastMigration = await getLastMigration()

		if (!lastMigration) {
			console.log('✓ No migrations to rollback')
			process.exit(0)
		}

		const downFile = lastMigration.replace('.sql', '.down.sql')
		const downPath = join(import.meta.dir, downFile)

		const downSQL = readFileSync(downPath, 'utf-8')

		await sql.begin(async sql => {
			await sql.unsafe(downSQL)
			await removeMigrationRecord(lastMigration)
		})

		console.log(`✓ Rolled back: ${lastMigration}`)
		console.log('\n✓ Rollback completed successfully')
		process.exit(0)
	} catch (error) {
		console.error('\n✗ Rollback failed:', error)
		process.exit(1)
	}
}

rollback()
