const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const windowStateKeeper = require('electron-window-state');

let mainWindow;

function createWindow() {
    const mainWindowState = windowStateKeeper({
        defaultWidth: 1200,
        defaultHeight: 800,
    });

    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: true
        },
        icon: path.join(__dirname, 'icon.png')
    });

    mainWindow.loadURL('https://hub.fgg.com.cn/');
    mainWindow.setMenuBarVisibility(false);

    session.defaultSession.setDevicePermissionHandler((details) => {
        if (details.deviceType === 'hid') {
            return true;
        }
        return false;
    });

    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        if (permission === 'hid') {
            callback(true);
        } else {
            callback(false);
        }
    });

    session.defaultSession.on('select-hid-device', (event, details, callback) => {
        event.preventDefault();

        if (details.deviceList && details.deviceList.length > 0) {
            const deviceToSelect = details.deviceList.find(device =>
                device.productName && device.productName.includes('MAD')
            ) || details.deviceList[0];

            callback(deviceToSelect.deviceId);
        } else {
            callback('');
        }
    });

    session.defaultSession.on('hid-device-added', (event, device) => {
        console.log('Périphérique HID ajouté:', device);
    });

    session.defaultSession.on('hid-device-removed', (event, device) => {
        console.log('Périphérique HID retiré:', device);
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

process.on('uncaughtException', (error) => {
    console.error('Erreur non capturée:', error);
});