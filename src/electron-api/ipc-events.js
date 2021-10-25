import { ipcMain, dialog } from 'electron'


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