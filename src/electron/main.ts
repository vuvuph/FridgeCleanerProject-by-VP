import { app, BrowserWindow, Menu } from 'electron';
import { ipcMainHandle, isDev } from './util.js';
import { generateRecipe } from './generateRecipe.js';
import { getAssetPath, getPreloadPath, getUIPath } from './pathResolver.js';
import { createTray } from './tray.js';
import { createMenu } from './menu.js';
import path from 'path';
import { generateImage } from './generateImage.js';

app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    icon: path.join(getAssetPath(), "/favicon.ico"),
    width: 1280,
    height: 900,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  if (isDev()) {
    mainWindow.loadURL('http://localhost:5123');
  } else {
    mainWindow.loadFile(getUIPath());
  }

ipcMainHandle('generateRecipe', async (ingredients: string) => {
  const recipe = await generateRecipe(ingredients);
  return recipe;
});

ipcMainHandle('generateImage', async (query: string) => {
  console.log('Received image generation request for:', query);
  try {
    const image = await generateImage(query);
    console.log('Generated image URL:', image);
    return image;
  } catch (err) {
    console.error('Error generating image:', err);
    return '';
  }
});

  createTray(mainWindow);
  handleCloseEvents(mainWindow);
  createMenu(mainWindow);
});

function handleCloseEvents(mainWindow: BrowserWindow) {
  let willClose = false;

  mainWindow.on('close', (e) => {
    if (willClose) {
      return;
    }
    e.preventDefault();
    mainWindow.hide();
    if (app.dock) {
      app.dock.hide();
    }
  });

  app.on('before-quit', () => {
    willClose = true;
  });

  mainWindow.on('show', () => {
    willClose = false;
  });
}