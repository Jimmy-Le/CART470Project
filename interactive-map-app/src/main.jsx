import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.jsx'
import TaskList from './components/Database.jsx'
import IslandPreview from "./components/IslandPreview.jsx"
import IslandComponent from "./components/IslandComponent.jsx"

//getting my connections stuff
import Canvas from './components/connectionLines.jsx'
import IslandInformation from './components/ComponentIslandInformation.jsx'
import ZoomButtons from './components/ComponentZoomButtons.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    {/*<TaskList /> */}
    <IslandInformation />
   <IslandComponent/>
    
    <ZoomButtons />
    <IslandPreview />
  </StrictMode>,
)
