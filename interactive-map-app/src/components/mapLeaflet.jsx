import { useEffect, useState } from "react";
import IslandComponent from "../components/IslandComponent";
import {LeafletMap, TileLayer} from "https://cdn.jsdelivr.net/npm/leaflet@2.0.0-beta.4/dist/leaflet.js";


function MapLeaflet() {

  const startMapX = 45.50884;
  const startMapY = -73.58781;
  const startZoomLevel = 10;
  let map = null;
  // The variable and Setter function. useState([Default Value])
  const [islandArray, setIslandArray] = useState([]);

   useEffect(() => {
    activateMap();
  }, []);

  function activateMap(){
    if(map == null){
    map = new LeafletMap("map").setView([startMapX, startMapY], startZoomLevel);
    }
  
     //helper class
  class CustomTileLayer extends TileLayer {
    getTileUrl(coords) {
      return `../assets/blueBg.png`;
    }

    getAttribution() {
      return "Hochelaga Archipelago";
    }
  }

  //ADD this custom tile layer to the map
  new CustomTileLayer().addTo(map);
 

  }

 


 

  // Put HTML in here. Whatever is in here will render on screen when the component is called.
  // Variables are called using {variable_name}
  return (
      <div id="map" className="mapLeafletClass"> 
      </div>
  );
}

// Export using the same name as the Function name.
export default MapLeaflet;