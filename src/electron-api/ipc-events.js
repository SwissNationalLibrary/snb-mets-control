import { ipcMain, dialog, shell } from 'electron'
import path from 'path';

ipcMain.handle('choose-folder', async () => {
    let result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    if (result.canceled) {
        return null;
    } else {
        return result.filePaths[0];
    }
});

ipcMain.handle('choose-file', async (evt, filters) => {
    let result = await dialog.showOpenDialog({
        filters: filters,
        properties: ['openFile']
    });
    console.log(result);
    if (result.canceled) {
        return null;
    } else {
        return result.filePaths[0];
    }
});

ipcMain.handle('open-folder-with-file', async (evt, filePath) => {
    shell.showItemInFolder(path.normalize(filePath));
})