import { chromium, BrowserContext, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { startFixtureServer } from '../../../visual-agent/src/pje-fixture-server';
import { startLiveServer } from '../../../visual-agent/src/live-server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface TestResultItem {
  id: string;
  controlName: string;
  expectedAction: string;
  result: 'PASSED' | 'FAILED';
  evidenceScreenshot?: string;
  errorDetails?: string;
}

export class ExtensionRunnerHelper {
  context: BrowserContext | null = null;
  page: Page | null = null;
  fixtureServerPort = 49155;
  liveServerPort = 49160;
  fixtureServer: any = null;
  liveServer: any = null;
  consoleLogs: string[] = [];
  pageErrors: string[] = [];
  networkFailures: string[] = [];
  testResults: TestResultItem[] = [];
  artifactDir: string;
  screenshotsDir: string;

  constructor() {
    this.artifactDir = path.resolve(__dirname, '../../../artifacts/extension-validation');
    this.screenshotsDir = path.join(this.artifactDir, 'screenshots');
    fs.mkdirSync(this.screenshotsDir, { recursive: true });
    fs.mkdirSync(path.join(this.artifactDir, 'reports'), { recursive: true });
    fs.mkdirSync(path.join(this.artifactDir, 'console'), { recursive: true });
  }

  async setup(viewport = { width: 1440, height: 900 }) {
    this.fixtureServer = await startFixtureServer(this.fixtureServerPort);
    this.liveServer = await startLiveServer(path.resolve(__dirname, '../../../artifacts/live'), this.liveServerPort);

    const extensionDist = path.resolve(__dirname, '../../../extension/dist');
    const profilePath = path.resolve(__dirname, '../../../scratch/test_chrome_profile');

    const args = [
      `--disable-extensions-except=${extensionDist}`,
      `--load-extension=${extensionDist}`,
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ];

    this.context = await chromium.launchPersistentContext(profilePath, {
      headless: false, // headed inside Xvfb
      args,
      viewport
    });

    this.page = await this.context.newPage();

    this.page.on('console', msg => {
      const txt = `[${msg.type()}] ${msg.text()}`;
      this.consoleLogs.push(txt);
    });

    this.page.on('pageerror', err => {
      this.pageErrors.push(err.message);
    });

    this.page.on('requestfailed', req => {
      this.networkFailures.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
    });
  }

  async captureScreenshot(name: string): Promise<string> {
    if (!this.page) return '';
    const filePath = path.join(this.screenshotsDir, `${Date.now()}-${name}.png`);
    try {
      await this.page.screenshot({ path: filePath, fullPage: false });
    } catch (e) {
      await this.page.screenshot({ path: filePath, timeout: 5000 });
    }
    return filePath;
  }

  recordResult(id: string, controlName: string, expectedAction: string, passed: boolean, screenshotPath?: string, errorDetails?: string) {
    this.testResults.push({
      id,
      controlName,
      expectedAction,
      result: passed ? 'PASSED' : 'FAILED',
      evidenceScreenshot: screenshotPath ? path.relative(this.artifactDir, screenshotPath) : undefined,
      errorDetails
    });
  }

  async teardown() {
    if (this.page) await this.page.close().catch(() => {});
    if (this.context) await this.context.close().catch(() => {});
    if (this.fixtureServer) this.fixtureServer.close();
    if (this.liveServer) this.liveServer.close();

    // Write console log file
    fs.writeFileSync(
      path.join(this.artifactDir, 'console', 'browser-console.log'),
      this.consoleLogs.join('\n')
    );

    // Write or merge JSON test results
    const jsonPath = path.join(this.artifactDir, 'reports', 'extension-test-results.json');
    let existing: TestResultItem[] = [];
    if (fs.existsSync(jsonPath)) {
      try {
        existing = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      } catch (e) {}
    }
    const combined = [...existing, ...this.testResults];
    fs.writeFileSync(jsonPath, JSON.stringify(combined, null, 2));
  }
}

