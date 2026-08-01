import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_DIR = path.resolve(__dirname, '../fixtures');

let activeFixtureServer: http.Server | null = null;

export function startFixtureServer(port: number = 49155): Promise<http.Server> {
  if (activeFixtureServer && activeFixtureServer.listening) {
    return Promise.resolve(activeFixtureServer);
  }

  return new Promise((resolve, reject) => {
    let retries = 10;

    const attemptListen = () => {
      const server = http.createServer((req, res) => {
        const reqUrl = req.url || '/';
        let filePath = path.join(FIXTURES_DIR, reqUrl);
        if (reqUrl === '/' || reqUrl === '') {
          filePath = path.join(FIXTURES_DIR, 'painel-tarefas-tabela.html');
        }

        if (!filePath.endsWith('.html') && !filePath.endsWith('.css') && !filePath.endsWith('.js')) {
          filePath += '.html';
        }

        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Fixture not found: ' + reqUrl);
          } else {
            const ext = path.extname(filePath);
            const mime = ext === '.html' ? 'text/html' : ext === '.css' ? 'text/css' : 'application/javascript';
            res.writeHead(200, { 'Content-Type': `${mime}; charset=utf-8` });
            res.end(data);
          }
        });
      });

      server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          if (retries > 0) {
            retries--;
            setTimeout(attemptListen, 400);
          } else {
            console.log(`[PJe Fixture Server] Port ${port} bound by external process, reusing active server instance.`);
            resolve({
              close: (cb?: Function) => {
                activeFixtureServer = null;
                if (cb) cb();
              }
            } as any);
          }
        } else {
          reject(err);
        }
      });

      server.listen(port, '127.0.0.1', () => {
        activeFixtureServer = server;
        server.on('close', () => {
          activeFixtureServer = null;
        });
        console.log(`[PJe Fixture Server] Serving fixtures at http://127.0.0.1:${port}`);
        resolve(server);
      });
    };

    attemptListen();
  });
}
