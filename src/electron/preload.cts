import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  generateRecipe: (ingredients: string) => {
    return ipcInvoke('generateRecipe', ingredients);
  },
  generateImage: (query: string) => {
    return ipcInvoke('generateImage', query);
  },
});

function ipcInvoke<Key extends keyof EventPayloadMapping>(
  key: Key,
  payload?: EventPayloadMapping[Key]
): Promise<any> {
  return ipcRenderer.invoke(key, payload);
}