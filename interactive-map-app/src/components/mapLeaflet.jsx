import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import IslandComponent from "../components/IslandComponent";
import { useMemo } from "react";
import { createPortal } from "react-dom";
import { divIcon } from "leaflet";

//for placeholder islands
import blueIsland from "../assets/blue.png";
import greenIsland from "../assets/green.png";

function MapLeaflet(){

  //JIMMMMMMMY REPLACE THE STUFF IN THIS ARRAY WITH YOUR OWN DATA
    const islandArray = [
    {
      id: "montreal",
      name: "Montreal",
      position: [45.50884, -73.58781],
      normalImage: blueIsland,
      focusedImage: greenIsland,
    },
    {
      id: "ile-jesus",
      name: "Île Jésus",
      position: [45.6, -73.73],
      normalImage: greenIsland,
      focusedImage: blueIsland,
    },
  ];

  function renderIslandMarker(island) {
    return (
      <IslandMarker
        key={island.id}
        island={island}
      />
    );
  }



return(
  <MapContainer id="map" center={[45.50884, -73.58781]} zoom={13} scrollWheelZoom={true}>
  <TileLayer
    attribution='Hochelaga Archipelago'
    url="../assets/blueBg.png"
  />
 {islandArray.map(renderIslandMarker)}
</MapContainer>
)

}


//-----------HELPER-----------------
//this will turn the island markers into IslandComponents
//we feed it an island (give it the id)
function IslandMarker(props) {
  const island = props.island;
  //will handle click events
  const onSelect = props.onSelect;

  //empty div to hold our island component
  const iconElement = useMemo(function createIconElement() {
    return document.createElement("div");
  }, []);

  //use Memo remembers the element it created to avoid remaking it a bunch of times
  const markerIcon = useMemo(function createMarkerIcon() {
    return divIcon({
      html: iconElement,
      className: "island-marker-icon",
      iconSize: [10, 10],
      //the icon will be centered on the coords
      iconAnchor: [5, 5],
    });
  }, [iconElement]);


  function handleMarkerClick() {
    onSelect(island.id);
  }


  //Portal Renders the island component inside the empty div we made

  return (
    <>
      <Marker
        position={island.position}
        icon={markerIcon}
        eventHandlers={{ click: handleMarkerClick }}
      />
      
      {createPortal(
        <IslandComponent
          islandName={island.name}
          islandWatercolor={island.normalImage}
          islandSVG={island.focusedImage}
        />,
        iconElement,
      )}
    </>
  );
}




export default MapLeaflet;
// import IslandComponent from "../components/IslandComponent";
// import {LeafletMap, TileLayer} from "https://cdn.jsdelivr.net/npm/leaflet@2.0.0-beta.4/dist/leaflet.js";
// import { MapContainer, useMap } from 'react-leaflet'





// function MapLeaflet() {

//   const startMapX = 45.50884;
//   const startMapY = -73.58781;
//   const startZoomLevel = 10;
//   let map = null;
//   // The variable and Setter function. useState([Default Value])
//   const [islandArray, setIslandArray] = useState([]);

//    useEffect(() => {
//     activateMap();
//   }, []);

//   function activateMap(){
//     if(map == null){
//     map = new LeafletMap("map").setView([startMapX, startMapY], startZoomLevel);
//     }
  
//      //helper class
//   class CustomTileLayer extends TileLayer {
//     getTileUrl(coords) {
//       return `../assets/blueBg.png`;
//     }

//     getAttribution() {
//       return "Hochelaga Archipelago";
//     }
//   }

//   //ADD this custom tile layer to the map
//   new CustomTileLayer().addTo(map);
 
//   addIslands(arrayOfIslands);

//   }

//  //VVVVVVVVVVVV GARBAGE vvvvvvvvvvvvvvvvv
// function addIslands(arrayOfIslands){

//   //test islands
// let montrealCoord = { lat: 45.50884, lng: -73.58781 };
// let ileJesusCoord = { lat: 45.6, lng: -73.73 };
// let montrealIsland = IslandComponent.constructor(
//       map,
//       "assets/audio/seagulls.mp3",
//       "assets/blue.png",
//       "assets/blue.png",
//       montrealCoord,
//       "montreal",
//     );
// let ileJesus = IslandComponent.constructor(
//       map,
//       "assets/audio/seagulls.mp3",
//       "assets/green.png",
//       "assets/green.png",
//       ileJesusCoord,
//       "ile Jesus",
//     );

// arrayOfIslands.push(montrealIsland, ileJesus);

//   for(i = 0; i< arrayOfIslands.length; i++){
//     islandArray = [arrayOfIslands[i]];
//   }
// }

//  // ^^^^^^^^^^^^ end of garbage (hopefully) ^^^^^^^^^^^^^^^^^

//   // Put HTML in here. Whatever is in here will render on screen when the component is called.
//   // Variables are called using {variable_name}
//   return (
//       <div id="map" className="mapLeafletClass"> 
//       </div>
//   );
// }

// // Export using the same name as the Function name.
// export default MapLeaflet;