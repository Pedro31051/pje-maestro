import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { StepEvent } from './step-reporter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateHTMLReport(sessionDir: string, events: StepEvent[]): string {
  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PJe Maestro - Relatório de Evidência Visual (Self-Contained)</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 30px; }
    header { border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 30px; }
    h1 { color: #38bdf8; margin: 0 0 10px 0; font-size: 24px; }
    .meta { color: #94a3b8; font-size: 14px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 24px; }
    .card { background: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); }
    .card-header { padding: 14px 18px; background: #334155; display: flex; justify-content: space-between; align-items: center; }
    .step-number { background: #0284c7; color: white; padding: 2px 8px; border-radius: 999px; font-weight: bold; font-size: 12px; }
    .step-title { font-weight: bold; font-size: 14px; color: #f8fafc; }
    .card-body { padding: 14px 18px; display: flex; flex-direction: column; gap: 10px; }
    .card-body img { width: 100%; border-radius: 8px; border: 1px solid #475569; display: block; }
    .hash { font-family: monospace; font-size: 11px; color: #64748b; word-break: break-all; }
    .status-ok { background: #10b981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; }
  </style>
</head>
<body>
  <header>
    <h1>📸 PJe Maestro — Relatório de Evidência Visual Completo</h1>
    <div class="meta">
      Sessão: <strong>${path.basename(sessionDir)}</strong> | Total Etapas Capturadas: <strong>${events.length}</strong> | Data: <strong>${new Date().toLocaleString('pt-BR')}</strong>
    </div>
  </header>
  <main>
    <div class="grid">
      ${events.map(e => {
        let base64Src = '';
        let fullImgPath = path.resolve(path.dirname(sessionDir), e.screenshot);
        if (!fs.existsSync(fullImgPath)) {
          fullImgPath = path.join(sessionDir, 'screenshots', path.basename(e.screenshot));
        }

        if (fs.existsSync(fullImgPath)) {
          const imgBuf = fs.readFileSync(fullImgPath);
          base64Src = `data:image/png;base64,${imgBuf.toString('base64')}`;
        }

        return `
          <div class="card">
            <div class="card-header">
              <span class="step-number">Etapa #${e.step}</span>
              <span class="step-title">${e.name}</span>
              <span class="status-ok">${e.status.toUpperCase()}</span>
            </div>
            <div class="card-body">
              ${base64Src ? `<img src="${base64Src}" alt="${e.name}" />` : `<div style="padding:20px; color:#ef4444;">Imagem não encontrada: ${e.screenshot}</div>`}
              <div class="meta">URL: ${e.urlSanitized}</div>
              <div class="hash">SHA256: ${e.sha256}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  </main>
</body>
</html>`;

  const reportPath = path.join(sessionDir, 'index.html');
  fs.writeFileSync(reportPath, htmlContent);
  console.log(`[Artifact Index] Generated standalone HTML report with embedded Base64 images at: file://${reportPath}`);
  return reportPath;
}

if (process.argv[1] && process.argv[1].endsWith('artifact-index.ts')) {
  const rootArtifacts = path.resolve(__dirname, '../../artifacts/sessions');
  if (fs.existsSync(rootArtifacts)) {
    const sessions = fs.readdirSync(rootArtifacts).sort().reverse();
    if (sessions.length > 0) {
      const latest = path.join(rootArtifacts, sessions[0]);
      const manifestPath = path.join(latest, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        const events: StepEvent[] = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        generateHTMLReport(latest, events);
      }
    }
  }
}
