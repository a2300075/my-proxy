const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// 最初に表示される入力画面
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>大進化・完全無敵プロキシ</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; background-color: #1a1a1a; color: #fff; }
                input[type="text"] { width: 450px; padding: 12px; font-size: 16px; border: none; border-radius: 20px; outline: none; }
                button { padding: 12px 25px; font-size: 16px; background-color: #ff4757; color: white; border: none; border-radius: 20px; cursor: pointer; margin-left: 10px; }
            </style>
        </head>
        <body>
            <h2>🔥 大進化・完全無敵プロキシ 🔥</h2>
            <p>Google検索も動画も、URLを入力して突撃！</p>
            <form action="/proxy" method="get">
                <input type="text" name="url" placeholder="https://google.com" required>
                <button type="submit">無敵突撃！</button>
            </form>
        </body>
        </html>
    `);
});

// すべてのJavaScriptや検索の動きを「身代わり」になって中継する魔法の処理
app.use('/proxy', (req, res, next) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.send('URLを入力してください');

    const proxy = createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        pathRewrite: { '^/proxy': '' },
        router: (req) => req.query.url,
        ssl: { rejectUnauthorized: false },
        onProxyRes: function (proxyRes, req, res) {
            // サイトから返ってきたクッキーやデータをChromebookに安全に渡す
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
        }
    });
    proxy(req, res, next);
});

app.listen(10000, () => {
    console.log('Ultimate Proxy Server is running on port 10000');
});
