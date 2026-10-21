import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route} from "react-router-dom";
import './index.css'
import App from './App.jsx'

import IslandPreview from "./components/IslandPreview.jsx"
import IslandComponent from "./components/IslandComponent.jsx"
import IslandList from "./components/IslandList.jsx"

//getting my connections stuff
import Canvas from './components/connectionLines.jsx'
import IslandInformation from './components/ComponentIslandInformation.jsx'
import ZoomButtons from './components/ComponentZoomButtons.jsx'
import HomePage from './pages/HomePage.jsx';
import IslandsPage from './pages/IslandsPage.jsx';
import Admin from './pages/Admin.jsx';

//for the disappearing components stuff

/***
 * To add a new "Page"
 * add a new route, inside the <Routes> tag
 * Template:
 * <Route path="/[PATHNAME]" element={<[PAGECOMPONENT] />} />
 * 
 * In App.jsx, add the new path to the navigation bar if you wish.
 */

createRoot(document.getElementById('root')).render(
  <StrictMode>    

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IslandsPage />}/>
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>


  </StrictMode>,
)
