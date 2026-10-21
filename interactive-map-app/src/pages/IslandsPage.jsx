
import IslandInformation from '../components/ComponentIslandInformation.jsx'
import ZoomButtons from '../components/ComponentZoomButtons.jsx'

import IslandPreview from "../components/IslandPreview.jsx"
import IslandComponent from "../components/IslandComponent.jsx"
import IslandList from "../components/IslandList.jsx"
import App from "../App.jsx"

import '../App.css'

export default function IslandsPage() {
    return (
        <body>
            <App />
            <IslandList/>
            <IslandPreview/>
            <IslandComponent/>
            <ZoomButtons />
            <IslandInformation />
        </body>


    );
}