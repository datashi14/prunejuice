const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

class DesktopApp {
    constructor() {
        this.mainWindow = null;
        this.tray = null;
        this.bridgeProcess = null;
        this.pythonProcess = null;
    }

    init() {
        // Prevent multiple instances
        const gotTheLock = app.requestSingleInstanceLock();
        if (!gotTheLock) {
            app.quit();
        } else {
            app.on('second-instance', () => {
                if (this.mainWindow) {
                    if (this.mainWindow.isMinimized()) this.mainWindow.restore();
                    this.mainWindow.focus();
                }
            });

            app.whenReady().then(() => {
                this.startServices();
                this.createWindow();
                this.createTray();
            });

            // Quit when all windows are closed, except on macOS
            app.on('window-all-closed', () => {
                if (process.platform !== 'darwin') {
                    app.quit();
                }
            });

            app.on('activate', () => {
                if (BrowserWindow.getAllWindows().length === 0) {
                    this.createWindow();
                }
            });

            app.on('will-quit', () => {
                this.stopServices();
            });
        }
    }

    startServices() {
        console.log('Starting backend services...');

        // 1. Start Bridge Server (Node)
        // 1. Start Bridge Server (Node)
        let bridgePath;
        let bridgeCwd;
        
        if (app.isPackaged) {
            // In production, 'bridge' is copied to 'resources/bridge' via extraResources
            bridgePath = path.join(process.resourcesPath, 'bridge', 'api-server.js');
            bridgeCwd = path.join(process.resourcesPath, 'bridge');
        } else {
            // In development
            bridgePath = path.join(__dirname, '../../bridge/api-server.js');
            bridgeCwd = path.join(__dirname, '../../bridge');
        }

        console.log(`Launching Bridge from: ${bridgePath}`);
        
        this.bridgeProcess = spawn('node', [bridgePath], {
            cwd: bridgeCwd,
            stdio: 'inherit'
        });

        // 2. Start Python Backend
        // In real dev env, we might rely on the Bridge to spawn Python, 
        // or spawn independently here. We'll let the Bridge handle Python as per api-server.js logic,
        // OR we can spawn it here directly if we want tighter control.
        // For simplicity, let's assume api-server.js spawns python_server.py as designed in Phase 3.
        
        // 3. Start Penpot Backend (Separate complex task, usually Docker)
        // For this local version, we assume Penpot is running via Docker Compose separately 
        // or we bundle a lighter version.
        // We will just point to localhost:9001 (Penpot Default) later.
    }

    stopServices() {
        if (this.bridgeProcess) this.bridgeProcess.kill();
        if (this.pythonProcess) this.pythonProcess.kill();
    }

    createWindow() {
        this.mainWindow = new BrowserWindow({
            width: 1600,
            height: 900,
            title: 'Prune Juice',
            icon: path.join(__dirname, 'assets/icon.png'),
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false, // For easier IPC in prototype
                webviewTag: true // Enable <webview> for Penpot
            }
        });

        const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
        
        if (isDev) {
            this.mainWindow.loadURL('http://localhost:3000');
            // this.mainWindow.webContents.openDevTools();
        } else {
            this.mainWindow.loadFile(path.join(__dirname, '../dist-react/index.html'));
        }    }

    createTray() {
        this.tray = new Tray(path.join(__dirname, 'assets/icon.png')); // Placeholder path
        const contextMenu = Menu.buildFromTemplate([
            { label: 'Open Creative Suite', click: () => this.mainWindow.show() },
            { label: 'Quit', click: () => app.quit() }
        ]);
        this.tray.setToolTip('Prune Juice');
        this.tray.setContextMenu(contextMenu);
    }
}

// Instantiate
new DesktopApp().init();
