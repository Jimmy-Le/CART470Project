import { useEffect, useState } from "react";


function ComponentName() {

  // The variable and Setter function. useState([Default Value])
  const [variable, setVariable] = useState(["Default Value Here"]);

  // Example: Timers, Fetching Data from the database, subscribing to events. This is optional, feel free to remove.
  useEffect(() => {
  }, []);

  // You can make functions inside of here
  function newFunction(){
    setVariable("John Doe");
  };

  // Put HTML in here. Whatever is in here will render on screen when the component is called.
  // Variables are called using {variable_name}
  return (
      <div>
          <p> hi {variable} </p>
          <button onClick={newFunction}> my button </button>
      </div>
  );
}

// Export using the same name as the Function name.
export default ComponentName;