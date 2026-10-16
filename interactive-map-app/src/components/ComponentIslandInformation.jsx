import { useEffect, useState } from "react";
import "../App.css";

function IslandInformation() {

  // The variable and Setter function. useState([Default Value])
  const [title, setTitle] = useState(["This is the Title"]);
  const [description, setDescription] = useState(["Île Deslauriers is a small island in the Saint Lawrence River just east of Montreal that is famous for hosting one of the largest breeding colonies of ring-billed gulls in North America."]);

  // Example: Timers, Fetching Data from the database, subscribing to events. This is optional, feel free to remove.
  useEffect(() => {
  }, []);

  // You can make functions inside of here
  // function newFunction(){
  //   setVariable("John Doe");
  // };

  // Put HTML in here. Whatever is in here will render on screen when the component is called.
  // Variables are called using {variable_name}
  return (
      <div class="w-1/3 min-w-75">
          <h2 class="pt-5 font-900">
             {title} 
          </h2>
          <p class="text-left p-5 pt-1 text-black text-sm">
            {description}
          </p>
      </div>
  );
}

// Export using the same name as the Function name.
export default IslandInformation;