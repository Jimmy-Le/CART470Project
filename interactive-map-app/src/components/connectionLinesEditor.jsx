import { useEffect, useState } from "react";
import CurvedLineOfImages from "./connectionLines";
import arrow from "../assets/arrow.svg";


function ConnectionsEditor() {

  // The variable and Setter function. useState([Default Value])
  const [lines, setLines] = useState([]);

  // You can make functions inside of here
  function addLine(event){
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

  //converts form values into number (you give it the form field name)
  function readNumber(name) {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return NaN;
  }

  if (value.trim() === "") {
    return NaN;
  }

  return Number(value);
}


    //getting the data
    const start = { x: readNumber("startX"), y: readNumber("startY") };
    const control = { x: readNumber("controlX"), y: readNumber("controlY") };
    const end = { x: readNumber("endX"), y: readNumber("endY") };
    const spacing = readNumber("spacing");


    //some safety checks, will make sure we don't have non  number values and that spacing is > 0
    if (
      ![start.x, start.y, control.x, control.y, end.x, end.y, spacing]
        .every(Number.isFinite) ||
      spacing <= 0
    ) {
      return;
    }

    //add the new line to the lines array
    setLines(function (currentLines) {
  return [
    ...currentLines,
    { start, control, end, spacing, src: arrow },
  ];
});


  };



  // Put HTML in here. Whatever is in here will render on screen when the component is called.
  // Variables are called using {variable_name}
  return (
      <div>
          <form id = "connectionsEditor" onSubmit={addLine}>
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
          <button type="submit" id="addLineButton">Add Line</button>
          </div>
          </form> 


         { /*this is where all the lines are displayed*/}
        <div style={{ position: "relative", minHeight: 900 }}>
        {lines.map((line, index) => (
          <CurvedLineOfImages key={index} {...line} />
        ))}
        </div>
          
         
    </div>
  );
}

// Export using the same name as the Function name.
export default ConnectionsEditor;