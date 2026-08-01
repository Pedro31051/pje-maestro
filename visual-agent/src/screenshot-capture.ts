import { Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export async function captureStepScreenshot(
  page: Page,
  sessionDir: string,
  liveDir: string,
  stepIndex: number,
  stepName: string
): Promise<string> {
  const paddedIndex = String(stepIndex).padStart(3, '0');
  const filename = `${paddedIndex}-${stepName}.png`;
  const screenshotsDir = path.join(sessionDir, 'screenshots');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  const targetPath = path.join(screenshotsDir, filename);

  try {
    // Attempt standard screenshot
    await page.screenshot({ path: targetPath, fullPage: false });
  } catch (e) {
    console.warn(`[Screenshot Capture] Retrying screenshot without fullPage for step ${stepIndex}:`, e);
    await page.screenshot({ path: targetPath, timeout: 5000 });
  }

  // Update live/current.jpg
  try {
    const liveCurrentJpg = path.join(liveDir, 'current.jpg');
    fs.copyFileSync(targetPath, liveCurrentJpg);
  } catch (e) {
    console.warn('[Screenshot Capture] Could not update live current.jpg:', e);
  }

  return targetPath;
}
