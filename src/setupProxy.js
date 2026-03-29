const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy /api requests to FraudService, keeping the /api prefix
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5005',
      changeOrigin: true,
      // Don't rewrite the path - this keeps /api in the forwarded request
      pathRewrite: function (path, req) {
        return path; // Return the path as-is
      },
      logLevel: 'debug',
    })
  );
};
