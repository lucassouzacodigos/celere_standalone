import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot, ReactDOM } from 'react-dom/client'
import App from './App'
import { createHashRouter, RouterProvider, useNavigate } from 'react-router-dom'

import Home from './Pages/Home'
import ConsultarAgendas from './Pages/ConsultarAgendas'
import Testandopesquisa from './Pages/testandopesquisa'
import Analytics from './Pages/Analytics'


const router = createHashRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/home',
    element: <Home />,
  },
  {
    path: '/ConsultarAgendas',
    element: <ConsultarAgendas />,
  },
  {
    path: 'testandopesquisa',
    element: <Testandopesquisa />,
  },
  {
    path: 'Analytics',
    element: <Analytics />,
  }

])

createRoot(document.getElementById('root')).render(

  <div>
    <RouterProvider router={router} />
  </div>
)

