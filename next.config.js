/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'standalone',
	experimental: {
		appDir: true,
	},
	allowedDevOrigins: ['http://localhost:3000'],
}

module.exports = nextConfig
