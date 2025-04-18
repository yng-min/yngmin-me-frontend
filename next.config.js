module.exports = {
    experimental: {},
    webpack(config, { dev, isServer }) {
        if (!dev && !isServer) {
            // 캐시를 디스크 대신 메모리로 저장
            config.cache = {
                type: 'memory', // 메모리 캐시 사용
            };
        }
        return config;
    }
};
