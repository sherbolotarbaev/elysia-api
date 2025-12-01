import { swagger } from '@elysiajs/swagger'

const swaggerConfig = swagger({
	exclude: ['/swagger'],
	autoDarkMode: true,
	scalarConfig: {
		theme: 'alternate',
		layout: 'modern',
		showSidebar: false,
		isEditable: false,
		hideModels: false,
		hideTestRequestButton: false,
		hideSearch: false,
		hideDarkModeToggle: false,
		withDefaultFonts: true,
		defaultOpenAllTags: false,
	},
	documentation: {
		info: {
			title: 'API Documentation',
			description:
				'Clean Architecture pattern for the Elysia + Bun + Postgres API.',
			version: '1.0.0',
		},
	},
})

export { swaggerConfig }
