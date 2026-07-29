import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { useEffect, useState } from 'react'

function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')

  const [dados, setDados] = useState()
  const getDadosLogin = async () => {
    const response = await window.electron.dadosLogin()
    setDados(response)
  }


  const openLoginPage = () => {
    window.electron.openLoginPage()
  }

  const consoleLogCookies = () => {
    window.electron.consoleLogCookies()
  }

  useEffect(() => {
    getDadosLogin()
  }, [])





  return (
    <div className="container">
      
      <div className="mainmenu flex-center">

        <button onClick={openLoginPage}>Login</button>
        <button onClick={consoleLogCookies}>Cookies</button>
        <button onClick={getDadosLogin}>getrdados</button>
        <button onClick={() => console.log(dados)}>Dados Login</button>
      </div>
    </div>
  )
}

export default App
