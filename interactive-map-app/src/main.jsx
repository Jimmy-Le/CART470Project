import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.jsx'
import TaskList from './components/Database.jsx'
import InformationalComponent from './components/InformationalComponent.jsx'
//getting my connections stuff
import Canvas from './components/connectionLines.jsx'
import IslandInformation from './components/ComponentIslandInformation.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    <TaskList />
    <Canvas />
    <IslandInformation />
    <InformationalComponent />
  </StrictMode>,
)
