/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {},
    headers: async () => {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-store, max-age=0, must-revalidate'
                    }
                ]
            }
        ]
    }
}

module.exports = nextConfig
