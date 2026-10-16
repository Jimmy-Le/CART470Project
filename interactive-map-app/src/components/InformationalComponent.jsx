import { useEffect, useState } from "react";
import reactImg from '../assets/react.svg';
import "../App.css";

function InformationalComponent() {

  // The variable and Setter function. useState([Default Value])
  const [title] = useState(["Polution"]);

  // Example: Timers, Fetching Data from the database, subscribing to events. This is optional, feel free to remove.
  useEffect(() => {
  }, []);


  // Put HTML in here. Whatever is in here will render on screen when the component is called.
  // Variables are called using {variable_name}
  return (
      <div className="informationBox">
          <div className="horizontal center bg-blue-500">
            <img src={reactImg} width="25" height="25"></img>
            <p>{title} </p>
          </div>
          <div className="textBox">
            <p>
              Ile Deslauriers is a small island in the Saint Lawrence River just east of Montreal that is famous for hosting one of the largest breeding colonies of ring-billed gulls in North America.
            </p>
          </div>
      </div>
  );
}

// Export using the same name as the Function name.
export default InformationalComponent;