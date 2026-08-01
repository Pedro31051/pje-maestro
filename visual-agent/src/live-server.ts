import http from 'http';
import fs from 'fs';
import path from 'path';

export function startLiveServer(liveDir: string, port: number = 49160): Promise<http.Server> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const reqUrl = req.url || '/';

      if (reqUrl === '/live' || reqUrl === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <title>PJe Maestro - Live Stream Feed</title>
            <style>
              body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
              .header { display: flex; align-items: center; justify-content: space-between; background: #1e293b; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; }
              .feed-container { display: flex; gap: 20px; }
              .img-box { flex: 2; background: #1e293b; padding: 10px; border-radius: 8px; border: 1px solid #334155; }
              .img-box img { width: 100%; border-radius: 6px; }
              .log-box { flex: 1; background: #1e293b; padding: 15px; border-radius: 8px; border: 1px solid #334155; max-height: 700px; overflow-y: auto; font-family: monospace; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>📹 PJe Maestro Visual Proof Agent - Feed Ao Vivo</h2>
              <span style="background:#10b981; color:white; padding:4px 8px; border-radius:999px; font-size:12px; font-weight:bold;">LIVE 🔴</span>
            </div>
            <div class="feed-container">
              <div class="img-box">
                <img id="live-img" src="/current.jpg?t=${Date.now()}" alt="Current Screenshot Feed" />
              </div>
              <div class="log-box">
                <h4>Eventos em Tempo Real</h4>
                <pre id="log-content">Carregando eventos...</pre>
              </div>
            </div>
            <script>
              setInterval(() => {
                document.getElementById('live-img').src = '/current.jpg?t=' + Date.now();
                fetch('/events')
                  .then(r => r.text())
                  .then(txt => { document.getElementById('log-content').innerText = txt; })
                  .catch(() => {});
              }, 1000);
            </script>
          </body>
          </html>
        `);
        return;
      }

      if (reqUrl.startsWith('/current.jpg')) {
        const jpgPath = path.join(liveDir, 'current.jpg');
        fs.readFile(jpgPath, (err, data) => {
          if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('No current screenshot yet.');
          } else {
            res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'no-cache' });
            res.end(data);
          }
        });
        return;
      }

      if (reqUrl.startsWith('/events')) {
        const eventsPath = path.join(liveDir, 'events.ndjson');
        fs.readFile(eventsPath, (err, data) => {
          if (err) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Aguardando eventos...');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(data.toString());
          }
        });
        return;
      }

      res.writeHead(404);
      res.end('Not Found');
    });

    server.listen(port, '127.0.0.1', () => {
      console.log(`[Visual Live Server] Dashboard ready at http://127.0.0.1:${port}/live`);
      resolve(server);
    });

    server.on('error', reject);
  });
}
