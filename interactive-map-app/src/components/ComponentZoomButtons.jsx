import { useEffect, useState } from "react";


function ZoomButtons() {

  // // The variable and Setter function. useState([Default Value])
  const [zoomPercentage, setZoomPercentage] = useState([100]);

  //might need to use this to actually make the zoom stuff work?
  // Example: Timers, Fetching Data from the database, subscribing to events. This is optional, feel free to remove.
  useEffect(() => {
  }, []);

  // You can make functions inside of here
  function zoomIn(){
    setZoomPercentage(parseInt(zoomPercentage) + 10);
    console.log("you are at "+ zoomPercentage + "%")
  };

  function zoomOut(){
    setZoomPercentage(parseInt(zoomPercentage) - 10);
    console.log("you are at "+ zoomPercentage + "%")
  }

  // Put HTML in here. Whatever is in here will render on screen when the component is called.
  // Variables are called using {variable_name}
  return (
      <div class="fixed right-1/10 bottom-1/6 flex flex-col gap-2">
          <button onClick={zoomIn} class="bg-black hover:bg-gray-700 w-10 rounded-md  text-white text-bold text-4xl "> + </button>
          <button onClick={zoomOut} class="bg-black hover:bg-gray-700 w-10 rounded-md  text-white text-bold text-4xl"> - </button>
      </div>
  );
}

// Export using the same name as the Function name.
export default ZoomButtons;