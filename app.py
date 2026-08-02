from flask import Flask, request, render_template_string, Response
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

app = Flask(__name__)

# 1. 最初に表示されるURLの入力画面（HTML）
INDEX_HTML = '''
<!DOCTYPE html>
<html>
<head>
    <title>マイ・専用プロキシサーバー</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; background-color: #f0f2f5; }
        input[type="text"] { width: 400px; padding: 10px; font-size: 16px; border: 1px solid #ccc; border-radius: 4px; }
        button { padding: 10px 20px; font-size: 16px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    </style>
</head>
<body>
    <h2>🚀 自分専用ウェブプロキシ 🚀</h2>
    <p>見たいサイトのURLを入力してね（例: https://example.com）</p>
    <form action="/go" method="get">
        <input type="text" name="url" placeholder="https://" required>
        <button type="submit">突撃！</button>
    </form>
</body>
</html>
'''

@app.route('/')
def index():
    return render_template_string(INDEX_HTML)

@app.route('/go')
def go():
    target_url = request.args.get('url')
    if not target_url.startswith('http'):
        target_url = 'https://' + target_url

    try:
        # 2. プロキシサーバーが代わりにサイトへアクセスして中身をダウンロード
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        res = requests.get(target_url, headers=headers, timeout=10)
        
        # もし画像やCSS（デザインファイル）なら、そのままブラウザに流す
        if 'text/html' not in res.headers.get('Content-Type', ''):
            return Response(res.content, content_type=res.headers.get('Content-Type'))

        # 3. 魔法の処理：ダウンロードしたHTMLの中にある画像やリンクのURLを、全部このプロキシ経由に書き換える！
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # リンク（aタグ）や画像（imgタグ）のURLを書き換えるループ処理
        for tag in soup.find_all(['a', 'img', 'link', 'script']):
            attr = 'src' if tag.name in ['img', 'script'] else 'href'
            if tag.has_attr(attr):
                # 元のURLを絶対パスに変換
                abs_url = urljoin(target_url, tag[attr])
                # このプロキシサーバー（/go?url=...）を通るようにURLを書き換える！
                if tag.name == 'a':
                    tag[attr] = f"/go?url={abs_url}"
                else:
                    tag[attr] = abs_url

        return str(soup)

except Exception as e:
    return f"<h3>❌ アクセスエラーが発生しました: {e}</h3>"

if __name__ == '__main__':
    # サーバーを起動（ポート5000番で待機）
    app.run(host='0.0.0.0', port=5000, debug=True)
