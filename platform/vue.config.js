const path = require('path');

// Express API (see root app/common/config.js `port`, default 8082). The Vue dev
// server runs on another port; without this proxy, `/api/*` hits webpack and fails.
const backendPort = process.env.BACKEND_PORT || process.env.PORT_API || '8082';
const backendOrigin = process.env.BACKEND_ORIGIN || `http://127.0.0.1:${backendPort}`;

function addStyleResource(rule) {
    rule.use('style-resource')
        .loader('style-resources-loader')
        .options({
            patterns: [
                path.resolve(__dirname, './src/main.less')
            ],
            injector: 'prepend'
        })
}
module.exports = {
    lintOnSave: false,
    devServer: {
        host: '0.0.0.0',
        allowedHosts: 'all',
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        // Valid URL (unlike the bare string "auto"). Lets the dev-server client infer
        // ws/wss and hostname from the page — required when the app is opened over
        // HTTPS (e.g. ngrok) while the dev server is plain HTTP on the LAN.
        client: {
            webSocketURL: 'auto://0.0.0.0:0/ws',
        },
        proxy: {
            '/api': { target: backendOrigin, changeOrigin: true },
            '/env.js': { target: backendOrigin, changeOrigin: true },
        },
    },
    chainWebpack: config => {
        const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
        types.forEach(type => addStyleResource(config.module.rule('less').oneOf(type)))
    }
}