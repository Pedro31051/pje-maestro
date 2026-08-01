import { Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export async function startCDPScreencast(page: Page, liveDir: string): Promise<() => Promise<void>> {
  try {
    const client = await page.context().newCDPSession(page);
    await client.send('Page.startScreencast', {
      format: 'jpeg',
      quality: 80,
      everyNthFrame: 1
    });

    client.on('Page.screencastFrame', async ({ data, sessionId }) => {
      try {
        const liveCurrentJpg = path.join(liveDir, 'current.jpg');
        fs.writeFileSync(liveCurrentJpg, Buffer.from(data, 'base64'));
        await client.send('Page.screencastFrameAck', { sessionId });
      } catch (e) {
        // ignore write errors during frame stream
      }
    });

    return async () => {
      try {
        await client.send('Page.stopScreencast');
      } catch (e) {
        // ignore
      }
    };
  } catch (e) {
    console.warn('[CDP Screencast] CDP session not supported in this mode:', e);
    return async () => {};
  }
}
