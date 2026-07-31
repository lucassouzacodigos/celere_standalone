import { app, shell, BrowserWindow, ipcMain, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {buscarProfissional} from './scripts/buscarProfissionais'
import * as cheerio from 'cheerio'

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

  // IPC MAIN WINDOW FUNCOES   ---------------------------------------------------------------------------------------------------------------------------------
  ipcMain.on('ping', () => console.log('png'))
  ipcMain.handle('dados-login', () => {
    return dadoslogin
  })
  






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

    loginWindow.webContents.on("did-finish-load", () => {
      loginWindow.webContents.executeJavaScript(`
          document.querySelector("#inputUsuario").value = " [REDACTED]"
        `)

      loginWindow.webContents.executeJavaScript(`
          document.querySelector("#inputSenha").value = " [REDACTED]"
        `)
    })

    loginWindow.webContents.on("did-navigate", async (event, url) => {
      console.log(url)
      const cookies = await session
      .fromPartition("persist:saude-session")
      .cookies.get({})
      console.log(cookies)

      
      
      if (url.includes("/pep") || url.includes("artes/adm")) {
        
        console.log("fechou")
        setTimeout(async () => {
          const textos = await loginWindow.webContents.executeJavaScript(`
              [...document.querySelectorAll('.greeting-text')]
                  .map(el => el.textContent.trim());
          `);
          dadoslogin = textos
          console.log(dadoslogin)

          setTimeout(() => {
            loginWindow.close()
          }, 100)
        }, 1000)
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

  //BUSCA PROFISSIONAL
  ipcMain.handle('buscar-profissional', async (event, dados) => {
    const response = await buscarProfissional(dados)
    console.log(response)
    return response
  })

  //get fast medic session
  ipcMain.handle('get-fast-medic-session', async () => {
    const ses = session.fromPartition("persist:saude-session");
    const [cookie] = await ses.cookies.get({name: "FAST_SessionId"})

    console.log(cookie?.value)
    return cookie?.value ?? null
  })

  //da get em todas as agendas na unidade logada
  ipcMain.handle('consultar-profissionais-com-agendas', async () => {
    const ses = session.fromPartition("persist:saude-session");
    const agendasURL = "https://sistema.saudepublica.digital/celere.embudasartes/Pep/Agenda/ConsultaAgendamentoInicialToMaster"

    const resposta = await ses.fetch(agendasURL)
    const html = await resposta.text()

    const $ = cheerio.load(html)

    const select =  $("#ConsultaAgendamento_ControlComboProfissional")

    console.log(select.html())
    console.log(select.attr("id"))
    
    const profissionais = [];

    select.find("option").each((_, option) => {
      profissionais.push({
        value: $(option).attr("value"),
        texto: $(option).text().trim(),
      });
    });

    return profissionais;
  })

  //Request pra verificar horarios com agendamentos de um dia especifico
  ipcMain.handle('verificar-horarios-do-dia', async (event, dados) => {
    console.log("IPCCAHAMDO")
    const ses = session.fromPartition("persist:saude-session");
    const requestDiaEspeficico = "https://sistema.saudepublica.digital/celere.embudasartes/Pep/Agenda/ConsultaListaHorariosAgendaProfissional"

    const resposta = await ses.fetch(requestDiaEspeficico, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: JSON.stringify(dados)
    })
    const html = await resposta.text()

    const $ = cheerio.load(html)

    const horarios = []

    $("#grdConsultaAgendamentoHorarios tr").each((_, tr) => {
      const tds = $(tr).find("td")

      horarios.push({
        hora: $(tds[0]).text().trim(),
        usuario: $(tds[1]).text().trim(),
        tipo: $(tds[2]).text().trim(),
        observacao: $(tds[3]).text().trim(),

        // atributos úteis do <tr>
        horaConsulta: $(tr).attr("data-horaconsulta"),
        horaComparecimento: $(tr).attr("data-horacomparecimento"),
        seqAgenda: $(tr).attr("data-seqagenda"),
        codParametroAgenda: $(tr).attr("data-codparametroagenda"),
        liberaUso: $(tr).attr("data-liberauso") === "True",
        encaixe: $(tr).attr("data-indencaixe") === "True",
      })
    })
    console.log(horarios)
    return horarios
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

