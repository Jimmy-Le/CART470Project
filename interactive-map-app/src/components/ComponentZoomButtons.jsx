import { useEffect, useState } from "react";


function ZoomButtons() {

  // // The variable and Setter function. useState([Default Value])
  const [zoomPercentage, setZoomPercentage] = useState(100);

  //might need to use this to actually make the zoom stuff work?
  // Example: Timers, Fetching Data from the database, subscribing to events. This is optional, feel free to remove.
  useEffect(() => {
  }, []);

  useEffect(() => {
   const islandContainer = document.querySelector(".island-blue");
   if (islandContainer) {
      islandContainer.style.transform= "scale(" + zoomPercentage/100 + ")"
    }
  }, [zoomPercentage]);

  function zoomIn() {
    if(zoomPercentage < 300)
    setZoomPercentage(parseInt(zoomPercentage) + 10);
  }

  function zoomOut() {
    if(zoomPercentage > 10){
      setZoomPercentage(parseInt(zoomPercentage) - 10);
    }
  }

  // // You can make functions inside of here
  // function zoomIn(){
  //   setZoomPercentage(parseInt(zoomPercentage) + 10);
  //   console.log("you are at "+ zoomPercentage + "%")
  //   let islandContainer = document.querySelector(".island-blue")
  //   islandContainer.style.transform= "scale(" + zoomPercentage/100 + ")"
  // };

  // function zoomOut(){
  //   setZoomPercentage(parseInt(zoomPercentage) - 10);
  //   console.log("you are at "+ zoomPercentage + "%")
  //   let islandContainer = document.querySelector(".island-blue")
  //   islandContainer.style.transform= "scale(" + zoomPercentage/100 + ")"
  // }

  
  // Put HTML in here. Whatever is in here will render on screen when the component is called.
  // Variables are called using {variable_name}
  return (
      <div class="fixed right-1/12 bottom-1/6 flex flex-col gap-2">
          <button onClick={zoomIn} class="bg-black hover:bg-gray-700 w-10 rounded-md  text-white text-bold text-4xl "> + </button>
          <button onClick={zoomOut} class="bg-black hover:bg-gray-700 w-10 rounded-md  text-white text-bold text-4xl"> - </button>
      </div>
  );
}

// Export using the same name as the Function name.
export default ZoomButtons;