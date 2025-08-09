import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ChefEnPlaceApp from './ChefEnPlaceApp'
import { Toaster } from 'react-hot-toast'
import { Provider } from 'react-redux'
import { store } from './app/store'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ChefEnPlaceApp />
        <Toaster position="top-center" />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
