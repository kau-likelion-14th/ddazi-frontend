const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(
        "/api",
        createProxyMiddleware({
            target: "http://Lte-dev-env.eba-krexzm3p.ap-northeast-2.elasticbeanstalk.com",
            changeOrigin: true,
        })
    );
};