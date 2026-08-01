import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { redactUrl } from './redactor';

export interface StepEvent {
  step: number;
  name: string;
  timestamp: string;
  urlSanitized: string;
  screenshot: string;
  sha256: string;
  extensionVersion: string;
  status: 'ok' | 'error';
  details?: Record<string, any>;
}

export class StepReporter {
  private events: StepEvent[] = [];
  private sessionDir: string;
  private liveDir: string;

  constructor(sessionDir: string, liveDir: string) {
    this.sessionDir = sessionDir;
    this.liveDir = liveDir;

    fs.mkdirSync(this.sessionDir, { recursive: true });
    fs.mkdirSync(this.liveDir, { recursive: true });
  }

  recordStep(
    stepNumber: number,
    name: string,
    url: string,
    screenshotPath: string,
    status: 'ok' | 'error' = 'ok',
    details?: Record<string, any>
  ): StepEvent {
    let sha256 = 'N/A';
    if (fs.existsSync(screenshotPath)) {
      const fileBuffer = fs.readFileSync(screenshotPath);
      sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    }

    const relScreenshotPath = path.relative(path.dirname(this.sessionDir), screenshotPath);

    const event: StepEvent = {
      step: stepNumber,
      name,
      timestamp: new Date().toISOString(),
      urlSanitized: redactUrl(url),
      screenshot: relScreenshotPath,
      sha256,
      extensionVersion: '0.1.0',
      status,
      details
    };

    this.events.push(event);

    // Append to live/events.ndjson
    const liveNdjson = path.join(this.liveDir, 'events.ndjson');
    fs.appendFileSync(liveNdjson, JSON.stringify(event) + '\n');

    // Append to session manifest.json
    const sessionManifest = path.join(this.sessionDir, 'manifest.json');
    fs.writeFileSync(sessionManifest, JSON.stringify(this.events, null, 2));

    console.log(`[Visual Reporter] Step ${stepNumber} [${name}] recorded. Hash: ${sha256.substring(0, 8)}...`);
    return event;
  }

  getEvents(): StepEvent[] {
    return this.events;
  }
}
