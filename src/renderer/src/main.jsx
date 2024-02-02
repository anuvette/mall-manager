import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './assets/ToastOverride.css'
import MyRoutes from './MyRoutes'
import { AuthContextProvider } from './components/AuthContext'

const root = document.getElementById('root')
const queryClient = new QueryClient()

createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <HashRouter>
          <ToastContainer hideProgressBar={true} />
          <MyRoutes />
        </HashRouter>
      </AuthContextProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
