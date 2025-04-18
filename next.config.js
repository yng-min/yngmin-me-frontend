module.exports = {
    webpack(config, { dev, isServer }) {
        if (!dev) {
            config.cache = false; // 캐시 비활성화
        }
        return config;
    },
};
