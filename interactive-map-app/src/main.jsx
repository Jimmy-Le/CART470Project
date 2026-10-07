import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.jsx'
import TaskList from './components/Database.jsx'
//getting my connections stuff
import Canvas from './components/connectionLines.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    <TaskList />
    <Canvas />
  </StrictMode>,
)
