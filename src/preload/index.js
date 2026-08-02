import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  //mediador de funcoes
  window.electron = {
    openLoginPage: () => ipcRenderer.send('open-login-page'),
    consoleLogCookies: () => ipcRenderer.send('console-log-cookies'),
    getFastMedicSession: () => ipcRenderer.invoke('get-fast-medic-session'),
    dadosLogin: () => ipcRenderer.invoke('dados-login'),
    buscarProfissional: (dados) => ipcRenderer.invoke('buscar-profissional', dados),
    consultarProfissionaisComAgendas: () => ipcRenderer.invoke('consultar-profissionais-com-agendas'),
    verificarHorariosDoDia: (dados) => ipcRenderer.invoke('verificar-horarios-do-dia', dados),
    getUserIDByCNS: (dados) => ipcRenderer.invoke('get-user-id-by-cns', dados),
    agendarUsuarioPorCPFouCNS: (dados) => ipcRenderer.invoke('agendar-usuario-por-cpfoucns', dados),
    sendDadosUnidade: (callback) => {ipcRenderer.on('login-atualizado', (_event, dados) => {callback(dados)})},
    limparCache: () => ipcRenderer.invoke('limpar-sessao'),

  }
  window.api = api
}
