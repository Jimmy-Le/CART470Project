import { useEffect, useState } from "react";
import NameInput from "./NameInput";

function CreateIsland() {
  const languages = ["EN", "FR", "OTHER"]
  const [data, setData] = useState({
    en:{
        name:"",
        description:"",
    },
    fr:{
        name:"",
        description:"",
    },
    other:{
        name:"",
        description:"",
    },
    
    imageID: null,
    connections:{},

  });


  // Put HTML in here. Whatever is in here will render on screen when the component is called.
  // Variables are called using {variable_name}
  return (
      <div>
          
      </div>
  );
}

// Export using the same name as the Function name.
export default CreateIsland;