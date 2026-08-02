const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// 【超軽量化】無駄な装飾をすべて削ぎ落とした、爆速の入力画面
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>PROXY V8</title>
            <style>
                body { background:#000; color:#0f0; font-family:monospace; text-align:center; padding-top:100px; }
                input { width:400px; padding:10px; background:#111; color:#0f0; border:1px solid #0f0; font-family:monospace; }
                button { padding:10px 20px; background:#0f0; color:#000; border:none; cursor:pointer; font-weight:bold; }
            </style>
        </head>
        <body>
            <h2>[ PROXY VERSION 8 ]</h2>
            <form action="/proxy" method="get">
                <input type="text" name="url" placeholder="youtube.com" required>
                <button type="submit">GO</button>
            </form>
        </body>
        </html>
    `);
});

// 【表示全ブッパ】リダイレクト暴走を完全に防ぎ、プロキシ内部にページを閉じ込める処理
app.use('/proxy', (req, res, next) => {
    let targetUrl = req.query.url;
    if (!targetUrl) return res.send('URL Required');

    // 自動URL補完（httpなしでもOK）
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
    }

    // 元のURLのドメイン（例: https://youtube.com）を正確に抽出
    let originUrl;
    try {
        const parsed = new URL(targetUrl);
        originUrl = parsed.origin;
    } catch (e) {
        return res.send('Invalid URL');
    }

    const proxy = createProxyMiddleware({
        target: originUrl, // 暴走しないようにドメインの根本をガッチリ固定！
        changeOrigin: true,
        followRedirects: true, // サイト側の転送にもしっかりついていく
        pathRewrite: (path, req) => {
            // 行き先のパス（/watch?v=... など）を正しく復元する魔法の処理
            try {
                const u = req.query.url;
                const fullUrl = u.startsWith('http') ? u : 'https://' + u;
                return new URL(fullUrl).pathname + new URL(fullUrl).search;
            } catch(e) {
                return path;
            }
        },
        ssl: { rejectUnauthorized: false },
        onProxyRes: function (proxyRes, req, res) {
            // i-FILTERのブロックの引き金になる邪魔なセキュリティヘッダーを徹底消去！
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
            
            // クッキーのドメイン制限を解除して、ログインや動画再生をスムーズにする
            if (proxyRes.headers['set-cookie']) {
                proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map(cookie => 
                    cookie.replace(/Domain=[^;]+;?/i, '')
                );
            }
        }
    });
    proxy(req, res, next);
});

app.listen(10000, () => {
    console.log('Server is running on port 10000');
});
