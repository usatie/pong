/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverActions: {
			allowedOrigins: ['localhost:4242'],
		},
	},
};

module.exports = nextConfig;
