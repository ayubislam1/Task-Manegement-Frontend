import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RouterProvider } from "react-router";
import router from './router/router.jsx';
import ContextProvider from './context/ContextProvider.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
  <ContextProvider><RouterProvider router={router}></RouterProvider></ContextProvider>
  </StrictMode>,
)
