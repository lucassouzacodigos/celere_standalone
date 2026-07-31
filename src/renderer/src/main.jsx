import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot, ReactDOM } from 'react-dom/client'
import App from './App'
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom'

import Home from './Pages/Home'
import ConsultarAgendas from './Pages/ConsultarAgendas'


const router = createBrowserRouter([
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
  }

])

createRoot(document.getElementById('root')).render(

  <div>
    <RouterProvider router={router} />
  </div>
)

