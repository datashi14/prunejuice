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
        const bridgePath = path.join(__dirname, '../../bridge/api-server.js');
        this.bridgeProcess = spawn('node', [bridgePath], {
            cwd: path.join(__dirname, '../../bridge'),
            stdio: 'inherit' // Pipe output for debug
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
            title: 'Open Creative Suite',
            icon: path.join(__dirname, 'assets/icon.png'),
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false, // For easier IPC in prototype
                webviewTag: true // Enable <webview> for Penpot
            }
        });

        // Load the React App
        // In Dev: localhost:3000
        // In Prod: index.html
        const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../build/index.html')}`;
        
        // During dev, we might just load the local React dev server
        // this.mainWindow.loadURL('http://localhost:3000');
        
        // For this file generation, we'll assume we build the React app later.
        // We'll point to a placeholder or the dev server.
        this.mainWindow.loadURL('http://localhost:3000'); 
    }

    createTray() {
        this.tray = new Tray(path.join(__dirname, 'assets/icon.png')); // Placeholder path
        const contextMenu = Menu.buildFromTemplate([
            { label: 'Open Creative Suite', click: () => this.mainWindow.show() },
            { label: 'Quit', click: () => app.quit() }
        ]);
        this.tray.setToolTip('Open Creative Suite');
        this.tray.setContextMenu(contextMenu);
    }
}

// Instantiate
new DesktopApp().init();
