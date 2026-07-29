import { app, shell, BrowserWindow, ipcMain, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let dadoslogin

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      partition: "persist:saude-session",
      contextIsolation: false,
      nodeIntegration: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

//WHENR READY ---------------------------------------------
app.whenReady().then(async () => {
  const ses = session.fromPartition("persist:saude-session");
  //limpa cache
  await ses.clearStorageData();
  await ses.clearCache();
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC FUNCOES   ---------------------------------------------------------------------------------------------------------------------------------
  ipcMain.on('ping', () => console.log('pong'))

  // Abre a janela de login e vai pra celere
  ipcMain.on('open-login-page', () => {
    const loginWindow = new BrowserWindow({
      width: 1100,
      height: 700,
      show: true,
      autoHideMenuBar: true,
      title: 'Login',
      
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        partition: "persist:saude-session",
        contextIsolation: false,
        nodeIntegration: true,
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    loginWindow.loadURL("https://sistema.saudepublica.digital/celere.embudasartes")

    loginWindow.webContents.on("did-navigate", async (event, url) => {
      console.log(url)
      const cookies = await session
      .fromPartition("persist:saude-session")
      .cookies.get({})
      console.log(cookies)

      
      
      if (url.includes("/pep") || url.includes("artes/adm")) {
        
        console.log("fechou")
        setTimeout(() => {
          loginWindow.close()
        }, 500)
        console.log(dadoslogin)
      }
    })
  })

  //PRINT COOKIES
  ipcMain.on('console-log-cookies', async () => {
    const cookies = await session
    .fromPartition("persist:saude-session")
    .cookies.get({})
    console.log(cookies)
  })




  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

