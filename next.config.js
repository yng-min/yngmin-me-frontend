/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        serverActions: true, // 서버 액션 사용 시
    },
    webpack(config, { dev, isServer }) {
        if (!dev) {
            // 프로덕션에서만 캐시 비활성화
            config.cache = false;
        }
        return config;
    },
    output: 'standalone',  // 서버리스 방식으로 동작
};

module.exports = nextConfig;
