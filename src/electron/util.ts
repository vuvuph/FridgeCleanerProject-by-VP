import { ipcMain, WebContents, WebFrameMain } from 'electron';
import { getUIPath } from './pathResolver.js';
import { pathToFileURL } from 'url';
import * as dotenv from 'dotenv';

dotenv.config();

export function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function ipcMainHandle<Key extends keyof EventPayloadMapping>(
  key: Key,
  handler: (payload: EventPayloadMapping[Key]) => Promise<string>
) {
  ipcMain.handle(key, (event, payload) => {
    if (event.senderFrame) {
      validateEventFrame(event.senderFrame);
    } else {
      throw new Error('Event sender frame is null');
    }
    return handler(payload);
  });
}

export function validateEventFrame(frame: WebFrameMain) {
  if (isDev() && new URL(frame.url).host === 'localhost:5123') {
    return;
  }
  if (frame.url !== pathToFileURL(getUIPath()).toString()) {
    throw new Error('Malicious event');
  }
}

export function getGroqApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    console.error('GROQ_API_KEY is not set.');
    process.exit(1);
  }
  return key;
}

export function getGoogleCustomSearchApiKey(): string {
  const key = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
  if (!key) {
    console.error('GOOGLE_CUSTOM_SEARCH_API_KEY is not set.');
    process.exit(1);
  }
  return key;
}

export function getGoogleCustomSearchCx(): string {
  const cx = process.env.GOOGLE_CUSTOM_SEARCH_CX;
  if (!cx) {
    console.error('GOOGLE_CUSTOM_SEARCH_CX is not set.');
    process.exit(1);
  }
  return cx;
}