import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Preloader from './Preloader.jsx'

function Root() {
  const [preloading, setPreloading] = useState(true)

  return (
    <>
      {preloading && <Preloader onDone={() => setPreloading(false)} />}
      <App />
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
