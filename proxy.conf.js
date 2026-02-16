const PROXY_CONFIG = {
  "/api": {
    target: "https://api.restful-api.dev",
    secure: true,
    changeOrigin: true,
    logLevel: "debug",
    pathRewrite: {
      "^/api": ""
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyReq.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[Proxy] ${req.method} ${req.url} <- ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
      console.error('[Proxy Error]', err);
    }
  }
};

module.exports = PROXY_CONFIG;
