
module.exports = {
    experimental: {},
    webpack: (config) => {
        config.resolve.extensions.push('.mjs');
        return config;
    }
};
