import { defineConfig, build } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildExtension() {
  console.log('[Vite Build] Bundling background, options & popup (ES)...');
  await build({
    configFile: false,
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          'src/background/service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
          'src/options/options': resolve(__dirname, 'src/options/options.html'),
          'src/popup/popup': resolve(__dirname, 'src/popup/popup.html'),
        },
        output: {
          entryFileNames: '[name].js',
          format: 'es'
        }
      }
    }
  });

  console.log('[Vite Build] Bundling content script (IIFE)...');
  await build({
    configFile: false,
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      rollupOptions: {
        input: {
          'bootstrap': resolve(__dirname, 'src/content/bootstrap.ts'),
        },
        output: {
          entryFileNames: 'src/content/[name].js',
          format: 'iife',
          name: 'PJeMaestroContent'
        }
      }
    }
  });

  // Copy manifest.json, styles.css & popup.css
  fs.copyFileSync(resolve(__dirname, 'manifest.json'), resolve(__dirname, 'dist/manifest.json'));
  
  const cssSrc = resolve(__dirname, 'src/ui/styles.css');
  const cssDistDir = resolve(__dirname, 'dist/src/ui');
  if (fs.existsSync(cssSrc)) {
    fs.mkdirSync(cssDistDir, { recursive: true });
    fs.copyFileSync(cssSrc, resolve(cssDistDir, 'styles.css'));
  }

  const popupCssSrc = resolve(__dirname, 'src/popup/popup.css');
  const popupCssDistDir = resolve(__dirname, 'dist/src/popup');
  if (fs.existsSync(popupCssSrc)) {
    fs.mkdirSync(popupCssDistDir, { recursive: true });
    fs.copyFileSync(popupCssSrc, resolve(popupCssDistDir, 'popup.css'));
  }

  console.log('[Vite Build] Extension built successfully in IIFE & ES formats with Action Popup.');
}

export default defineConfig({});

if (process.argv[1] && process.argv[1].endsWith('vite.config.ts')) {
  buildExtension();
}
