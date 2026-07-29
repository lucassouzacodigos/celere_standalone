import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'

function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')




  const openLoginPage = () => {
    window.electron.openLoginPage()
  }

  const consoleLogCookies = () => {
    window.electron.consoleLogCookies()
  }





  return (
    <div className="container">
      
      <div className="mainmenu flex-center">

        <button onClick={openLoginPage}>Login</button>
        <button onClick={consoleLogCookies}>Cookies</button>
      
      </div>
    </div>
  )
}

export default App
