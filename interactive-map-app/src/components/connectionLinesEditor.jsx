import { useEffect, useState } from "react";


function ConnectionsEditor() {

  // The variable and Setter function. useState([Default Value])
  const [variable, setVariable] = useState(["Default Value Here"]);

  // Example: Timers, Fetching Data from the database, subscribing to events. This is optional, feel free to remove.
  useEffect(() => {
  }, []);

  // You can make functions inside of here
  function addLine(){
    
  };

  // Put HTML in here. Whatever is in here will render on screen when the component is called.
  // Variables are called using {variable_name}
  return (
      <div>
          <form id = "connectionsEditor">
          <div> 
          <h2>Start</h2>
          <label for="startX">X:</label>
          <input type="text" id="startX" name="startX"/>
          <label for="startY">Y:</label>
          <input type="text" id="startY" name="startY"/>
          </div>
         
          
          <div>
          <h2>Control</h2>
          <label for="controlX">X:</label>
          <input type="text" id="controlX" name="controlX"/>
          <label for="controlY">Y:</label>
          <input type="text" id="controlY" name="controlY"/>
          </div>

          <div>
          <h2>End</h2>
          <label for="endX">X:</label>
          <input type="text" id="endX" name="endX"/>
          <label for="endY">Y:</label>
          <input type="text" id="endY" name="endY"/>
          </div>
          
          <div>
          <h2>Spacing</h2>
          <label for="spacing">Space between:</label>
          <input type="text" id="spacing" name="spacing"/>
          </div>

          <div>
            <h2>Icon</h2>
            <label for="lineIcon">Image:</label>

            <select name="lineIcon" id="lineIcon">
              <option value="arrow">Arrow</option>
              <option value="bird">Bird</option>
            </select>
          </div>

          <div>
          <button onClick={addLine} id="addLineButton">Add Line</button>
          </div>
          </form> 

          
         
    </div>
  );
}

// Export using the same name as the Function name.
export default ConnectionsEditor;