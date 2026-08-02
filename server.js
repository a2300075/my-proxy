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
                <input type="text" name="url" placeholder="google.com" required>
                <button type="submit">無敵突撃！</button>
            </form>
        </body>
        </html>
    `);
});

// 通信を中継する処理
app.use('/proxy', (req, res, next) => {
    let targetUrl = req.query.url;
    if (!targetUrl) return res.send('URLを入力してください');

    // httpから始まってない場合は自動で補完する
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
    }

    // 正しい形で行き先をセットし直す魔法の修正
    const proxy = createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        pathRewrite: { '^/proxy': '' },
        router: function(req) {
            // リクエストごとに自動補完されたURLを正しく返すように修正！
            let u = req.query.url;
            if (!u.startsWith('http://') && !u.startsWith('https://')) {
                u = 'https://' + u;
            }
            return u;
        },
        ssl: { rejectUnauthorized: false },
        onProxyRes: function (proxyRes, req, res) {
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
        }
    });
    proxy(req, res, next);
});

app.listen(10000, () => {
    console.log('Ultimate Proxy Server is running on port 10000');
});
