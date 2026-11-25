import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot, ReactDOM } from 'react-dom/client'
import App from './App'
import { createHashRouter, RouterProvider, useNavigate } from 'react-router-dom'

import Home from './Pages/Home'
import ConsultarAgendas from './Pages/ConsultarAgendas'
import Testandopesquisa from './Pages/Testandopesquisa'
import Analytics from './Pages/Analytics'
import AgendarColeta from './Pages/AgendarColeta'
import Filas from './Pages/Filas'
import Painel from './Pages/Painel'


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
    path: '/AgendarColetas',
    element: <AgendarColeta />,
  },
  {
    path: 'Testandopesquisa',
    element: <Testandopesquisa />,
  },
  {
    path: 'Filas',
    element: <Filas />,
  },
  {
    path: 'Analytics',
    element: <Analytics />,
  },
  {
    path: 'eat',
    element: <App />,
  },
  {
    path: 'Painel',
    element: <Painel />,
  },

])

createRoot(document.getElementById('root')).render(

  <div>
    <RouterProvider router={router} />
  </div>
)

